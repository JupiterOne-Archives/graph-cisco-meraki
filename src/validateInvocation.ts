import {
  IntegrationExecutionContext,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
  IntegrationProviderAuthorizationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from './collector';
import { IntegrationConfig } from './config';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  await isConfigurationValid(context);
}

async function isConfigurationValid({
  instance,
  logger,
}: IntegrationExecutionContext<IntegrationConfig>): Promise<void> {
  // perform test api call. This will fail if we do not have access.
  if (!instance.config.apiKey) {
    throw new IntegrationValidationError('API Key is required.');
  }

  try {
    const client = createServicesClient(instance.config, logger);
    await client.getOrganizations();
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      throw new IntegrationProviderAuthenticationError({
        status: err.status,
        statusText: err.statusText,
        endpoint: err.endpoint,
      });
    } else {
      throw new IntegrationProviderAPIError({
        status: err.status,
        statusText: err.statusText,
        endpoint: err.endpoint,
      });
    }
  }
}
