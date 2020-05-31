function createApiKeyEntityIdentifier(
  type: string,
  id: number | string,
): string {
  return `${type.replace(/_/g, '-')}:${id}`;
}

export default createApiKeyEntityIdentifier;
