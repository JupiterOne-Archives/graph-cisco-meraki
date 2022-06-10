import { IntegrationConfig } from '../config';

import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import validateInvocation from '../validateInvocation';

test('rejects if apiKey is not present', async () => {
  const context = createMockExecutionContext<IntegrationConfig>();
  context.instance.config.apiKey = (undefined as unknown) as string;

  await expect(validateInvocation(context)).rejects.toThrow(
    'API Key is required',
  );
});

test('rejects if unable to hit provider apis', async () => {
  const context = createMockExecutionContext<IntegrationConfig>();
  context.instance.config = { apiKey: 'test' };

  await expect(validateInvocation(context)).rejects.toThrow(
    'Provider authentication failed at https://api.meraki.com/api/v1/organizations: 401 Unauthorized',
  );
}, 10000);
