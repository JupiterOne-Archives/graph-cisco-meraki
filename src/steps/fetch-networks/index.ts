import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  createServicesClient,
  MerakiNetwork,
  MerakiOrganization,
} from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertNetwork } from '../../converter';
import { IntegrationConfig } from '../../config';

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
  logger,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>): Promise<void> {
  const client = createServicesClient(instance.config, logger);
  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organizationEntity) => {
      const organization = getRawData(organizationEntity) as MerakiOrganization;
      await client.iterateNetworks(
        organization.id,
        async (network: MerakiNetwork) => {
          const networkEntity = await jobState.addEntity(
            convertNetwork(network),
          );

          await jobState.addRelationship(
            createDirectRelationship({
              from: organizationEntity,
              to: networkEntity,
              _class: RelationshipClass.HAS,
            }),
          );
        },
      );
    },
  );
}
