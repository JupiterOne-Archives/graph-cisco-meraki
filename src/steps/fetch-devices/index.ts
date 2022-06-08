import { INTERNET } from '@jupiterone/data-model';
import {
  createDirectRelationship,
  createMappedRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import {
  createServicesClient,
  MerakiDevice,
  MerakiNetwork,
} from '../../collector';
import {
  Entities,
  MappedRelationships,
  Relationships,
  StepIds,
} from '../../constants';
import { convertDevice } from '../../converter';
import { IntegrationConfig } from '../../config';

export const deviceSteps = [
  {
    id: StepIds.FETCH_DEVICES,
    name: 'Fetch Devices',
    entities: [Entities.DEVICE],
    relationships: [Relationships.NETWORK_HAS_DEVICE],
    mappedRelationships: [MappedRelationships.DEVICE_CONNECTS_INTERNET],
    dependsOn: [StepIds.FETCH_NETWORKS],
    executionHandler: fetchDevices,
  },
];

export async function fetchDevices({
  instance,
  logger,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance.config, logger);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      const network = getRawData(networkEntity) as MerakiNetwork;
      await client.iterateDevices(network.id, async (device: MerakiDevice) => {
        const deviceEntity = await jobState.addEntity(convertDevice(device));
        await jobState.addRelationship(
          createDirectRelationship({
            from: networkEntity,
            to: deviceEntity,
            _class: RelationshipClass.HAS,
          }),
        );

        if (deviceEntity.publicIp) {
          await jobState.addRelationship(
            createMappedRelationship({
              _class: MappedRelationships.DEVICE_CONNECTS_INTERNET._class,
              _type: MappedRelationships.DEVICE_CONNECTS_INTERNET._type,
              _mapping: {
                relationshipDirection: RelationshipDirection.FORWARD,
                sourceEntityKey: deviceEntity._key,
                targetFilterKeys: [['_type', '_key']],
                targetEntity: INTERNET,
              },
            }),
          );
        }
      });
    },
  );
}
