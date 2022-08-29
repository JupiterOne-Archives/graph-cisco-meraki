import { MerakiClient } from '../collector';
import {
  convertProperties,
  createMappedRelationship,
  Entity,
  parseTimePropertyValue,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { MappedRelationships, TargetEntities } from '../constants';

export const convertNetworkClientRelationship = (
  sourceEntity: Entity,
  client: MerakiClient,
): Relationship => {
  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    _type: MappedRelationships.NETWORK_HAS_CLIENT._type,
    source: sourceEntity,
    targetFilterKeys: [['_class', 'macAddress']],
    target: {
      ...convertProperties(client),
      _key: TargetEntities.CLIENT._type + ':' + client.id,
      _type: TargetEntities.CLIENT._type,
      _class: TargetEntities.CLIENT._class,
      displayName: client.description || client.mac,
      macAddress: client.mac,
      ipAddress: client.ip,
      firstSeenOn: parseTimePropertyValue(client.firstSeen),
      lastSeenOn: parseTimePropertyValue(client.lastSeen),
    },
  });
};

export const convertVlanClientRelationship = (
  sourceEntity: Entity,
  client: MerakiClient,
): Relationship => {
  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    _type: MappedRelationships.VLAN_HAS_CLIENT._type,
    source: sourceEntity,
    targetFilterKeys: [['_class', 'macAddress']],
    target: {
      ...convertProperties(client),
      _class: TargetEntities.CLIENT._class,
      displayName: client.description || client.mac,
      macAddress: client.mac,
      ipAddress: client.ip,
      firstSeenOn: parseTimePropertyValue(client.firstSeen),
      lastSeenOn: parseTimePropertyValue(client.lastSeen),
    },
  });
};
