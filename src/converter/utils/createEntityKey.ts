function createApiKeyEntityIdentifier(
  type: string,
  id: number | string,
): string {
  return `${type}:${id}`;
}

export default createApiKeyEntityIdentifier;
