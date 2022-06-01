import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient, MerakiNetwork } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertSSID } from '../../converter';
import { IntegrationConfig } from '../../types';

export const wifiSteps = [
  {
    id: StepIds.FETCH_WIFI,
    name: 'Fetch Meraki Wifi',
    entities: [Entities.WIFI],
    relationships: [Relationships.NETWORK_HAS_WIFI],
    dependsOn: [StepIds.FETCH_NETWORKS],
    executionHandler: fetchWifi,
  },
];

export async function fetchWifi({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      if (networkEntity.type === 'wireless') {
        const network = getRawData(networkEntity) as MerakiNetwork;

        const ssids = await client.getSSIDs(network.id);
        // TODO convert to iterateEntities pattern when client supports it

        const ssidEntities: Entity[] = [];

        for (const ssid of ssids) {
          if (!ssid.name.startsWith('Unconfigured')) {
            ssid.psk = 'REDACTED';
            const ssidEntity = convertSSID(ssid, network.id);
            delete ssidEntity.CIDR; // deletes '255.255.255.255' placeholder CIDR
            ssidEntities.push(ssidEntity);
          }
        }

        await jobState.addEntities(ssidEntities);

        for (const ssidEntity of ssidEntities) {
          await jobState.addRelationship(
            createDirectRelationship({
              from: networkEntity,
              to: ssidEntity,
              _class: RelationshipClass.HAS,
            }),
          );
        }
      }
    },
  );
}
