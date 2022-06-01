import { convertNetworkClientRelationship } from '../../converter';
// import { IntegrationConfig } from '../../types';

import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient } from '../../collector';
import { Entities, MappedRelationships, StepIds } from '../../constants';
import { IntegrationConfig } from '../../types';

export const clientSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: StepIds.FETCH_CLIENTS,
    name: 'Fetch Meraki Network Clients',
    entities: [],
    relationships: [],
    mappedRelationships: [
      MappedRelationships.NETWORK_HAS_CLIENT,
      MappedRelationships.VLAN_HAS_CLIENT,
    ],
    dependsOn: [StepIds.FETCH_NETWORKS],
    async executionHandler({
      instance,
      jobState,
    }: IntegrationStepExecutionContext<IntegrationConfig>) {
      const client = createServicesClient(instance);
      await jobState.iterateEntities(
        { _type: Entities.NETWORK._type },
        async (network) => {
          if (network.id) {
            try {
              const clients = await client.getClients(network.id as string);
              const relationships = clients.map((client) =>
                convertNetworkClientRelationship(network.id as string, client),
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
  },
];
