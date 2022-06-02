import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';
import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

export interface IntegrationConfig extends IntegrationInstanceConfig {
  apiKey: string;
}

export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  apiKey: {
    type: 'string',
    mask: true,
  },
};
