import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Liste tous les slots triés par row puis position
export const list = query({
  args: {},
  handler: async (ctx) => {
    const slots = await ctx.db
      .query("workSlots")
      .withIndex("by_position")
      .order("asc")
      .collect();
    // Sort by row (defaulting to 0) then position
    return slots.sort((a, b) => {
      const rowA = a.row ?? 0;
      const rowB = b.row ?? 0;
      if (rowA !== rowB) return rowA - rowB;
      return a.position - b.position;
    });
  },
});

// Créer un nouveau slot vide
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    // Trouver la position maximale dans row 0
    const slots = await ctx.db
      .query("workSlots")
      .collect();
    const row0Slots = slots.filter((s) => (s.row ?? 0) === 0);
    const maxPos = row0Slots.reduce((max, s) => Math.max(max, s.position), -1);
    const now = Date.now();

    const slotId = await ctx.db.insert("workSlots", {
      todoId: undefined,
      position: maxPos + 1,
      row: 0,
      notes: "",
      createdAt: now,
      updatedAt: now,
    });

    return slotId;
  },
});

// Créer un slot et y assigner un to-do en une seule opération
export const createAndAssign = mutation({
  args: {
    todoId: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Si le to-do était déjà dans un autre slot, libérer ce slot
    const existingSlot = await ctx.db
      .query("workSlots")
      .withIndex("by_todoId", (q) => q.eq("todoId", args.todoId))
      .first();

    if (existingSlot) {
      await ctx.db.patch(existingSlot._id, {
        todoId: undefined,
        updatedAt: Date.now(),
      });
    }

    // Trouver la position maximale dans row 0
    const slots = await ctx.db.query("workSlots").collect();
    const row0Slots = slots.filter((s) => (s.row ?? 0) === 0);
    const maxPos = row0Slots.reduce((max, s) => Math.max(max, s.position), -1);
    const now = Date.now();

    // Restaurer les notes sauvegardées du to-do si elles existent
    const slotId = await ctx.db.insert("workSlots", {
      todoId: args.todoId,
      position: maxPos + 1,
      row: 0,
      notes: todo.notes ?? "",
      createdAt: now,
      updatedAt: now,
    });

    // Marquer le to-do comme actif
    await ctx.db.patch(args.todoId, { isActive: true });

    return slotId;
  },
});

// Assigner un to-do à un slot
export const assignTodo = mutation({
  args: {
    slotId: v.id("workSlots"),
    todoId: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const todo = await ctx.db.get(args.todoId);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Si le to-do était déjà dans un autre slot, libérer ce slot
    const existingSlot = await ctx.db
      .query("workSlots")
      .withIndex("by_todoId", (q) => q.eq("todoId", args.todoId))
      .first();

    if (existingSlot && existingSlot._id !== args.slotId) {
      await ctx.db.patch(existingSlot._id, {
        todoId: undefined,
        updatedAt: Date.now(),
      });
    }

    // Si le slot cible avait déjà un to-do, sauvegarder les notes et le marquer comme non-actif
    if (slot.todoId) {
      const updates: { isActive: boolean; notes?: string } = { isActive: false };
      if (slot.notes.trim()) {
        updates.notes = slot.notes;
      }
      await ctx.db.patch(slot.todoId, updates);
    }

    // Assigner le nouveau to-do au slot, restaurer ses notes sauvegardées
    await ctx.db.patch(args.slotId, {
      todoId: args.todoId,
      notes: todo.notes ?? "",
      updatedAt: Date.now(),
    });

    // Marquer le to-do comme actif
    await ctx.db.patch(args.todoId, { isActive: true });

    return { slotId: args.slotId, todoId: args.todoId };
  },
});

// Mettre à jour les notes d'un slot
export const updateNotes = mutation({
  args: {
    slotId: v.id("workSlots"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    await ctx.db.patch(args.slotId, {
      notes: args.notes,
      updatedAt: Date.now(),
    });

    // Aussi sauvegarder sur le to-do en temps réel
    if (slot.todoId) {
      await ctx.db.patch(slot.todoId, { notes: args.notes });
    }

    return args.slotId;
  },
});

// Vider un slot (archiver les notes si to-do présent)
export const clear = mutation({
  args: {
    slotId: v.id("workSlots"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    // Sauvegarder les notes sur le to-do et le marquer comme non-actif
    if (slot.todoId) {
      const updates: { isActive: boolean; notes?: string } = { isActive: false };
      if (slot.notes.trim()) {
        updates.notes = slot.notes;
      }
      await ctx.db.patch(slot.todoId, updates);

      // Archiver aussi les notes
      if (slot.notes.trim()) {
        await ctx.db.insert("archivedNotes", {
          todoId: slot.todoId,
          notes: slot.notes,
          archivedAt: Date.now(),
        });
      }
    }

    // Vider le slot
    await ctx.db.patch(args.slotId, {
      todoId: undefined,
      notes: "",
      updatedAt: Date.now(),
    });

    return args.slotId;
  },
});

// Supprimer un slot
export const remove = mutation({
  args: {
    slotId: v.id("workSlots"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const slotRow = slot.row ?? 0;

    // Sauvegarder les notes sur le to-do et le marquer comme non-actif
    if (slot.todoId) {
      const updates: { isActive: boolean; notes?: string } = { isActive: false };
      if (slot.notes.trim()) {
        updates.notes = slot.notes;
      }
      await ctx.db.patch(slot.todoId, updates);

      // Archiver aussi les notes
      if (slot.notes.trim()) {
        await ctx.db.insert("archivedNotes", {
          todoId: slot.todoId,
          notes: slot.notes,
          archivedAt: Date.now(),
        });
      }
    }

    await ctx.db.delete(args.slotId);

    // Réorganiser les positions des slots restants dans la même row
    const allSlots = await ctx.db
      .query("workSlots")
      .collect();
    const rowSlots = allSlots
      .filter((s) => (s.row ?? 0) === slotRow)
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < rowSlots.length; i++) {
      if (rowSlots[i].position !== i) {
        await ctx.db.patch(rowSlots[i]._id, { position: i });
      }
    }

    return args.slotId;
  },
});

// Réorganiser les positions des slots (au sein d'une même row)
export const reorder = mutation({
  args: {
    slotId: v.id("workSlots"),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const slotRow = slot.row ?? 0;
    const oldPosition = slot.position;
    if (oldPosition === args.newPosition) {
      return args.slotId;
    }

    const allSlots = await ctx.db.query("workSlots").collect();
    const rowSlots = allSlots
      .filter((s) => (s.row ?? 0) === slotRow)
      .sort((a, b) => a.position - b.position);

    // Mettre à jour les positions
    for (const s of rowSlots) {
      if (s._id === args.slotId) {
        await ctx.db.patch(s._id, {
          position: args.newPosition,
          updatedAt: Date.now(),
        });
      } else if (oldPosition < args.newPosition) {
        // Déplacer vers la droite : décaler les slots entre old et new vers la gauche
        if (s.position > oldPosition && s.position <= args.newPosition) {
          await ctx.db.patch(s._id, { position: s.position - 1 });
        }
      } else {
        // Déplacer vers la gauche : décaler les slots entre new et old vers la droite
        if (s.position >= args.newPosition && s.position < oldPosition) {
          await ctx.db.patch(s._id, { position: s.position + 1 });
        }
      }
    }

    return args.slotId;
  },
});

// Déplacer un slot vers l'autre row (toggle focus <-> backburner)
export const moveToRow = mutation({
  args: {
    slotId: v.id("workSlots"),
    targetRow: v.number(),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }

    const currentRow = slot.row ?? 0;
    if (currentRow === args.targetRow) {
      return args.slotId;
    }

    const allSlots = await ctx.db.query("workSlots").collect();

    // Recalculer les positions de l'ancienne row (retirer le slot)
    const oldRowSlots = allSlots
      .filter((s) => (s.row ?? 0) === currentRow && s._id !== args.slotId)
      .sort((a, b) => a.position - b.position);
    for (let i = 0; i < oldRowSlots.length; i++) {
      if (oldRowSlots[i].position !== i) {
        await ctx.db.patch(oldRowSlots[i]._id, { position: i });
      }
    }

    // Trouver la position max dans la target row
    const targetRowSlots = allSlots.filter(
      (s) => (s.row ?? 0) === args.targetRow
    );
    const maxPos = targetRowSlots.reduce(
      (max, s) => Math.max(max, s.position),
      -1
    );

    // Mettre à jour le slot
    await ctx.db.patch(args.slotId, {
      row: args.targetRow,
      position: maxPos + 1,
      updatedAt: Date.now(),
    });

    return args.slotId;
  },
});

// Obtenir les notes archivées pour un to-do
export const getArchivedNotes = query({
  args: {
    todoId: v.id("todos"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("archivedNotes")
      .withIndex("by_todoId", (q) => q.eq("todoId", args.todoId))
      .order("desc")
      .collect();
  },
});
