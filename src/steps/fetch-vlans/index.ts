import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  createServicesClient,
  MerakiNetwork,
  MerakiVlan,
} from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertVlan } from '../../converter';
import { IntegrationConfig } from '../../config';

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
  logger,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance.config, logger);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      const network = getRawData(networkEntity) as MerakiNetwork;
      await client.iterateVlans(network.id, async (vlan: MerakiVlan) => {
        const vlanEntity = await jobState.addEntity(convertVlan(vlan));
        await jobState.addRelationship(
          createDirectRelationship({
            from: networkEntity,
            to: vlanEntity,
            _class: RelationshipClass.HAS,
          }),
        );
      });
    },
  );
}
