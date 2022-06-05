import { convertNetworkClientRelationship } from '../../converter';
// import { IntegrationConfig } from '../../types';

import {
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createServicesClient, MerakiNetwork } from '../../collector';
import { Entities, MappedRelationships, StepIds } from '../../constants';
import { IntegrationConfig } from '../../config';

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
    executionHandler: fetchClients,
  },
];

export async function fetchClients({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      const network = getRawData(networkEntity) as MerakiNetwork;
      await client.iterateClients(network.id, async (client) => {
        await jobState.addRelationship(
          convertNetworkClientRelationship(network.id, client),
        );
      });
    },
  );
}
