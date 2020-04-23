import { createMockExecutionContext } from '@jupiterone/integration-sdk/testing';

import validateInvocation from '../validateInvocation';

test('rejects if apiKey is not present', async () => {
  const context = createMockExecutionContext();
  context.instance.config.apiKey = undefined;

  await expect(validateInvocation(context)).rejects.toThrow(
    /Failed to authenticate/,
  );
});

test('rejects if unable to hit provider apis', async () => {
  const context = createMockExecutionContext();
  context.instance.config = { apiKey: 'test' };

  await expect(validateInvocation(context)).rejects.toThrow(
    /Failed to authenticate/,
  );
});
