import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './types';

const instanceConfigFields: IntegrationInstanceConfigFieldMap<IntegrationConfig> = {
  apiKey: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
