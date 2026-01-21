import schema from "../convex/schema";

describe("Convex Schema", () => {
  it("should define a todos table", () => {
    expect(schema.tables).toBeDefined();
    expect(schema.tables.todos).toBeDefined();
  });

  it("should have the correct structure for todos table", () => {
    const todosTable = schema.tables.todos;
    expect(todosTable).toBeDefined();

    // The table should have validators for text, completed, and order
    const validator = todosTable.validator;
    expect(validator).toBeDefined();
    expect(validator.kind).toBe("object");

    // Check field names exist in the validator
    const fields = validator.fields;
    expect(fields).toHaveProperty("text");
    expect(fields).toHaveProperty("completed");
    expect(fields).toHaveProperty("order");
  });

  it("should export a valid schema definition", () => {
    expect(schema).toBeDefined();
    expect(typeof schema).toBe("object");
  });
});
