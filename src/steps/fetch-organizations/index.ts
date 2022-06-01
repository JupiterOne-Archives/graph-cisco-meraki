import {
  createDirectRelationship,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertAccount, convertOrganization } from '../../converter';
import { IntegrationConfig } from '../../config';

export const organizationSteps = [
  {
    id: StepIds.FETCH_ORGANIZATIONS,
    name: 'Fetch Meraki Organizations',
    entities: [Entities.ORGANIZATION, Entities.ACCOUNT],
    relationships: [Relationships.ACCOUNT_HAS_ORGANIZATION],
    dependsOn: [],
    executionHandler: fetchOrganizations,
  },
];

export async function fetchOrganizations({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>): Promise<void> {
  const client = createServicesClient(instance);
  const orgs = await client.getOrganizations();
  const orgEntities = await jobState.addEntities(orgs.map(convertOrganization));

  const accountEntity = await jobState.addEntity(convertAccount(orgs[0]));

  for (const orgEntity of orgEntities) {
    await jobState.addRelationship(
      createDirectRelationship({
        from: accountEntity,
        to: orgEntity,
        _class: RelationshipClass.HAS,
      }),
    );
  }
}
