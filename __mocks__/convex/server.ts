export const query = (config: {
  args: object;
  handler: (...args: unknown[]) => unknown;
}) => ({
  ...config,
  isQuery: true,
});

export const mutation = (config: {
  args: object;
  handler: (...args: unknown[]) => unknown;
}) => ({
  ...config,
  isMutation: true,
});

export const action = (config: {
  args: object;
  handler: (...args: unknown[]) => unknown;
}) => ({
  ...config,
  isAction: true,
});

export const internalQuery = query;
export const internalMutation = mutation;
export const internalAction = action;

// Mock anyApi for generated API files
export const anyApi = new Proxy(
  {},
  {
    get: () =>
      new Proxy(
        {},
        {
          get: () => "mock-function-reference",
        }
      ),
  }
);

// Mock componentsGeneric for generated API files
export const componentsGeneric = () => ({});

interface TableConfig {
  validator: { kind: string; fields: Record<string, unknown> };
  indexes: Array<{ indexDescriptor: string; fields: string[] }>;
}

interface SchemaDefinition {
  tables: Record<string, TableConfig>;
}

export const defineTable = (fields: Record<string, unknown>) => {
  const indexes: Array<{ indexDescriptor: string; fields: string[] }> = [];

  const tableBuilder = {
    validator: { kind: "object", fields },
    indexes,
    index: (name: string, fieldList: string[]) => {
      indexes.push({ indexDescriptor: name, fields: fieldList });
      return tableBuilder;
    },
  };

  return tableBuilder;
};

export const defineSchema = (
  tables: Record<string, ReturnType<typeof defineTable>>
): SchemaDefinition => ({
  tables: tables as unknown as Record<string, TableConfig>,
});
