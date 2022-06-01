import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient, MerakiNetwork } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertVlan } from '../../converter';
import { IntegrationConfig } from '../../types';

export const vlansSteps = [
  {
    id: StepIds.FETCH_VLANS,
    name: 'Fetch Vlans',
    entities: [Entities.VLAN],
    relationships: [Relationships.NETWORK_HAS_VLAN],
    dependsOn: [StepIds.FETCH_NETWORKS],
    executionHandler: fetchVlans,
  },
];

export async function fetchVlans({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      // should always be string
      // but need to check to make TS work
      if (
        typeof networkEntity.id === 'string' &&
        networkEntity.id.startsWith('L_')
      ) {
        const network = getRawData(networkEntity) as MerakiNetwork;
        const vlans = await client.getVlans(network.id);

        const vlanEntities = await jobState.addEntities(vlans.map(convertVlan));

        for (const vlanEntity of vlanEntities) {
          await jobState.addRelationship(
            createDirectRelationship({
              from: networkEntity,
              to: vlanEntity,
              _class: RelationshipClass.HAS,
            }),
          );
        }
      }
    },
  );
}
