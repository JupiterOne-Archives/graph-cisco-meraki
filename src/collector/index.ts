import { IntegrationConfig } from '../config';

import { IntegrationInstance } from '@jupiterone/integration-sdk-core';

import { ServicesClient } from './ServicesClient';

export * from './types';

/**
 * Creates a ServicesClient from an integration instance using it's
 * api key.
 */
export function createServicesClient(
  instance: IntegrationInstance<IntegrationConfig>,
): ServicesClient {
  return new ServicesClient({ apiKey: instance.config.apiKey });
}
