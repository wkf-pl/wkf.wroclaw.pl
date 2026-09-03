export function createBlockParameterSuffix(
  blockID: null | string | undefined,
  path: string,
): string {
  const source = blockID || path
  return source.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'block'
}
