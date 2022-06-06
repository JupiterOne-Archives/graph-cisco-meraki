import {
  createDirectRelationship,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient, MerakiSamlRole } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertSamlRole } from '../../converter';
import { IntegrationConfig } from '../../config';

export const samlRoleSteps = [
  {
    id: StepIds.FETCH_SAML_ROLES,
    name: 'Fetch Meraki Admins',
    entities: [Entities.SAML_ROLE],
    relationships: [Relationships.ORGANIZATION_HAS_SAML_ROLE],
    dependsOn: [StepIds.FETCH_ORGANIZATIONS],
    executionHandler: fetchSamlRoles,
  },
];

export async function fetchSamlRoles({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance);

  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organizationEntity) => {
      await client.iterateSamlRoles(
        organizationEntity.id as string,
        async (samlRole: MerakiSamlRole) => {
          const samlRoleEntity = await jobState.addEntity(
            convertSamlRole(samlRole),
          );

          await jobState.addRelationship(
            createDirectRelationship({
              from: organizationEntity,
              to: samlRoleEntity,
              _class: RelationshipClass.HAS,
            }),
          );
        },
      );
    },
  );
}
