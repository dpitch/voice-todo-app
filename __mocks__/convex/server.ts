export const query = (config: {
  args: object;
  handler: (...args: unknown[]) => unknown;
}) => ({
  ...config,
  isQuery: true,
});
