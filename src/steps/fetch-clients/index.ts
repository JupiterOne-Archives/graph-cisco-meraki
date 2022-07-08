import {
  convertNetworkClientRelationship,
  convertVlanClientRelationship,
} from '../../converter';
// import { IntegrationConfig } from '../../types';

import {
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import {
  createServicesClient,
  MerakiClient,
  MerakiNetwork,
} from '../../collector';
import { Entities, MappedRelationships, StepIds } from '../../constants';
import { IntegrationConfig } from '../../config';
import createEntityKey from '../../converter/utils/createEntityKey';

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
  logger,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance.config, logger);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      const network = getRawData(networkEntity) as MerakiNetwork;
      await client.iterateClients(network.id, async (client: MerakiClient) => {
        const key = createEntityKey(
          Entities.VLAN._type,
          network.id + ':' + client.vlan,
        );
        // We aren't able to fetch all vlans, so the key may not exist
        const vlanEntity = await jobState.findEntity(key);
        if (vlanEntity) {
          await jobState.addRelationship(
            convertVlanClientRelationship(vlanEntity, client),
          );
        } else {
          // if we can't build the relationship from the vlan, build from the network instead
          await jobState.addRelationship(
            convertNetworkClientRelationship(networkEntity, client),
          );
        }
      });
    },
  );
}
