import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

export interface IntegrationConfig extends IntegrationInstanceConfig {
  apiKey: string;
}
