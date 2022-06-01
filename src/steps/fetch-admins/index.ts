import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient, MerakiOrganization } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertAdminUser } from '../../converter';
import { IntegrationConfig } from '../../types';

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
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance);

  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organizationEntity) => {
      const organization = getRawData(organizationEntity) as MerakiOrganization;
      const admins = await client.getAdmins(organization.id);
      const adminEntities = await jobState.addEntities(
        admins.map(convertAdminUser),
      );

      for (const adminEntity of adminEntities) {
        await jobState.addRelationship(
          createDirectRelationship({
            from: organizationEntity,
            to: adminEntity,
            _class: RelationshipClass.HAS,
          }),
        );
      }
    },
  );
}
