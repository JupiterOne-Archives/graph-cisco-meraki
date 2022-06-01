import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient, MerakiOrganization } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertNetwork } from '../../converter';
import { IntegrationConfig } from '../../types';

export const networkSteps = [
  {
    id: StepIds.FETCH_NETWORKS,
    name: 'Fetch Networks',
    entities: [Entities.NETWORK],
    relationships: [Relationships.ORGANIZATION_HAS_NETWORK],
    dependsOn: [StepIds.FETCH_ORGANIZATIONS],
    executionHandler: fetchNetworks,
  },
];

export async function fetchNetworks({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>): Promise<void> {
  const client = createServicesClient(instance);
  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organizationEntity) => {
      const organization = getRawData(organizationEntity) as MerakiOrganization;
      const networks = await client.getNetworks(organization.id);

      const networkEntities = await jobState.addEntities(
        networks.map(convertNetwork),
      );

      for (const networkEntity of networkEntities) {
        await jobState.addRelationship(
          createDirectRelationship({
            from: organizationEntity,
            to: networkEntity,
            _class: RelationshipClass.HAS,
          }),
        );
      }
    },
  );
}
