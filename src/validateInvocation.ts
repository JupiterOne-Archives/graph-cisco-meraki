import { IntegrationExecutionContext } from '@jupiterone/integration-sdk-core';

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

  if (await isConfigurationValid(context)) {
    context.logger.info('Integration instance is valid!');
  } else {
    throw new Error('Failed to authenticate with provided credentials');
  }
}

async function isConfigurationValid({
  instance,
  logger,
}: IntegrationExecutionContext<IntegrationConfig>): Promise<boolean> {
  // perform test api call. This will fail if we do not have access.
  try {
    const client = createServicesClient(instance.config, logger);
    await client.getOrganizations();
    return true;
  } catch (err) {
    return false;
  }
}
