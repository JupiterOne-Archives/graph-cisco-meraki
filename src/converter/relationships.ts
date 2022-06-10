import { MerakiClient } from '../collector';
import {
  convertProperties,
  createMappedRelationship,
  parseTimePropertyValue,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import createEntityKey from './utils/createEntityKey';
import { Entities, MappedRelationships, TargetEntities } from '../constants';

export const convertNetworkClientRelationship = (
  networkId: string,
  client: MerakiClient,
): Relationship =>
  createMappedRelationship({
    _class: RelationshipClass.HAS,
    _type: client.vlan
      ? MappedRelationships.VLAN_HAS_CLIENT._type
      : MappedRelationships.NETWORK_HAS_CLIENT._type,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey: client.vlan
        ? createEntityKey(Entities.VLAN._type, `${networkId}:${client.vlan}`)
        : createEntityKey(Entities.NETWORK._type, networkId),
      targetFilterKeys: [['_class', 'macAddress']],
      targetEntity: {
        ...convertProperties(client),
        _class: TargetEntities.CLIENT._class,
        displayName: client.description || client.mac,
        macAddress: client.mac,
        ipAddress: client.ip,
        firstSeenOn: parseTimePropertyValue(client.firstSeen),
        lastSeenOn: parseTimePropertyValue(client.lastSeen),
      },
    },
  });
