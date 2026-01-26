import schema from "../convex/schema";

describe("Convex Schema", () => {
  it("should define a todos table", () => {
    expect(schema.tables).toBeDefined();
    expect(schema.tables.todos).toBeDefined();
  });

  it("should have the correct structure for todos table", () => {
    const todosTable = schema.tables.todos;
    expect(todosTable).toBeDefined();

    const validator = todosTable.validator;
    expect(validator).toBeDefined();
    expect(validator.kind).toBe("object");

    // Check field names exist in the validator
    const fields = validator.fields;
    expect(fields).toHaveProperty("content");
    expect(fields).toHaveProperty("category");
    expect(fields).toHaveProperty("priority");
    expect(fields).toHaveProperty("isCompleted");
    expect(fields).toHaveProperty("completedAt");
    expect(fields).toHaveProperty("createdAt");
  });

  it("should have correct field types", () => {
    const todosTable = schema.tables.todos;
    const fields = todosTable.validator.fields;

    // content should be a string
    expect(fields.content.kind).toBe("string");

    // category should be a string
    expect(fields.category.kind).toBe("string");

    // priority should be a union of literals
    expect(fields.priority.kind).toBe("union");

    // isCompleted should be a boolean
    expect(fields.isCompleted.kind).toBe("boolean");

    // completedAt should be optional (wrapped in optional validator)
    expect(fields.completedAt.kind).toBe("optional");
    // The inner type is number
    expect(fields.completedAt.inner.kind).toBe("number");

    // createdAt should be a number
    expect(fields.createdAt.kind).toBe("number");
  });

  it("should have indexes defined", () => {
    const todosTable = schema.tables.todos;
    const indexes = todosTable.indexes;

    expect(indexes).toBeDefined();
    expect(indexes).toHaveLength(4);

    const indexNames = indexes.map(
      (idx: { indexDescriptor: string }) => idx.indexDescriptor
    );
    expect(indexNames).toContain("by_category");
    expect(indexNames).toContain("by_priority");
    expect(indexNames).toContain("by_isCompleted");
    expect(indexNames).toContain("by_createdAt");
  });

  it("should export a valid schema definition", () => {
    expect(schema).toBeDefined();
    expect(typeof schema).toBe("object");
  });
});
