import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import instanceConfigFields from './instanceConfigFields';
import fetchClients from './steps/fetch-clients';
import fetchResources from './steps/fetch-resources';
import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [fetchResources, fetchClients],
};
