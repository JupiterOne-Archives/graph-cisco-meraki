import { convertNetworkClientRelationship } from '../../converter';
import { IntegrationConfig } from '../../types';

import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { STEP_ID as FETCH_RESOURCES_STEP } from '../fetch-resources';

export const STEP_ID = 'fetch-clients';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch Meraki Network Clients',
  types: ['meraki_network_has_client', 'meraki_vlan_has_client'],
  dependsOn: [FETCH_RESOURCES_STEP],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const client = createServicesClient(instance);
    await jobState.iterateEntities(
      { _type: 'meraki_network' },
      async (network) => {
        if (network.id) {
          try {
            const clients = await client.getClients(network.id);
            const relationships = clients.map((client) =>
              convertNetworkClientRelationship(network.id, client),
            );
            await jobState.addRelationships(relationships);
          } catch (err) {
            if (err.errorCode != 400 && err.errCode != 404) {
              throw err;
            }
          }
        }
      },
    );
  },
};

export default step;
