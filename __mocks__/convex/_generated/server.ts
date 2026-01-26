// Mock for convex/_generated/server

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

export const httpAction = (config: {
  handler: (...args: unknown[]) => unknown;
}) => ({
  ...config,
  isHttpAction: true,
});
