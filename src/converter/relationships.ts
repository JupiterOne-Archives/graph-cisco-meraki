import { MerakiClient } from '../collector';
import { createIntegrationRelationship, Relationship, RelationshipDirection, convertProperties, getTime } from '@jupiterone/integration-sdk';
import createEntityKey from './utils/createEntityKey';

export const convertNetworkClientRelationship = (
  networkId: string,
  client: MerakiClient,
): Relationship =>
  createIntegrationRelationship({
    _class: 'HAS',
    _type: client.vlan
      ? 'meraki_vlan_has_client'
      : 'meraki_network_has_client',
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: client.vlan
        ? createEntityKey('meraki_vlan', `${networkId}:${client.vlan}`)
        : createEntityKey('meraki_network', networkId),
      targetFilterKeys: [["_class", "macAddress"]],
      targetEntity: {
        ...convertProperties(client),
        _class: ["Device", "Host"],
        displayName: client.description || client.mac,
        macAddress: client.mac,
        ipAddress: client.ip,
        firstSeenOn: getTime(client.firstSeen),
        lastSeenOn: getTime(client.lastSeen),
      },
    },
  });