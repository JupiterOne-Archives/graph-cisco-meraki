import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  createServicesClient,
  MerakiAdminUser,
  MerakiOrganization,
} from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertAdminUser } from '../../converter';
import { IntegrationConfig } from '../../config';

export const adminSteps = [
  {
    id: StepIds.FETCH_ADMINS,
    name: 'Fetch Meraki Admins',
    entities: [Entities.ADMIN],
    relationships: [Relationships.ORGANIZATION_HAS_ADMIN],
    dependsOn: [StepIds.FETCH_ORGANIZATIONS],
    executionHandler: fetchAdmins,
  },
];

export async function fetchAdmins({
  instance,
  logger,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organizationEntity) => {
      const organization = getRawData(organizationEntity) as MerakiOrganization;

      await client.iterateAdmins(
        organization.id,
        async (admin: MerakiAdminUser) => {
          const adminEntity = await jobState.addEntity(convertAdminUser(admin));

          await jobState.addRelationship(
            createDirectRelationship({
              from: organizationEntity,
              to: adminEntity,
              _class: RelationshipClass.HAS,
            }),
          );
        },
      );
    },
  );
}
