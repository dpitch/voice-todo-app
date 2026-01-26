// Mock for convex/values
export const v = {
  string: () => ({ kind: "string" }),
  number: () => ({ kind: "number" }),
  boolean: () => ({ kind: "boolean" }),
  null_: () => ({ kind: "null" }),
  id: (tableName: string) => ({ kind: "id", tableName }),
  array: (element: unknown) => ({ kind: "array", element }),
  object: (fields: Record<string, unknown>) => ({ kind: "object", fields }),
  union: (...members: unknown[]) => ({ kind: "union", members }),
  literal: (value: unknown) => ({ kind: "literal", value }),
  optional: (inner: unknown) => ({ kind: "optional", inner }),
  any: () => ({ kind: "any" }),
  record: (keys: unknown, values: unknown) => ({ kind: "record", keys, values }),
};
