import { IntegrationConfig } from '../config';

import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

import { ServicesClient } from './ServicesClient';

export * from './types';

/**
 * Creates a ServicesClient from an integration instance using it's
 * api key.
 */
export function createServicesClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): ServicesClient {
  return new ServicesClient({
    apiKey: config.apiKey,
    logger: logger,
  });
}
