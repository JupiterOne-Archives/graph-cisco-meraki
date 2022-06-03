import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createServicesClient, MerakiNetwork } from '../../collector';
import { Entities, Relationships, StepIds } from '../../constants';
import { convertSSID } from '../../converter';
import { IntegrationConfig } from '../../config';

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

const isWirelessNetwork = (network: MerakiNetwork) =>
  network.productTypes.includes('wireless');

export async function fetchWifi({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = createServicesClient(instance);
  await jobState.iterateEntities(
    { _type: Entities.NETWORK._type },
    async (networkEntity) => {
      const network = getRawData(networkEntity) as MerakiNetwork;
      if (isWirelessNetwork(network)) {
        await client.iterateSSIDs(network.id, async (ssid) => {
          if (!ssid.name.startsWith('Unconfigured')) {
            ssid.psk = 'REDACTED';
            const ssidEntity = await jobState.addEntity(
              convertSSID(ssid, network.id),
            );

            await jobState.addRelationship(
              createDirectRelationship({
                from: networkEntity,
                to: ssidEntity,
                _class: RelationshipClass.HAS,
              }),
            );
          }
        });
      }
    },
  );
}
