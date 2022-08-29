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

function createNetworkVlanHasClientKey(sourceKey: string, targetId: string) {
  return `${sourceKey}:${RelationshipClass.HAS}:${TargetEntities.CLIENT._type}:${targetId}`;
}

export const convertNetworkClientRelationship = (
  sourceEntity: Entity,
  client: MerakiClient,
): Relationship => {
  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    _key: createNetworkVlanHasClientKey(sourceEntity._key, client.id),
    _type: MappedRelationships.NETWORK_HAS_CLIENT._type,
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

export const convertVlanClientRelationship = (
  sourceEntity: Entity,
  client: MerakiClient,
): Relationship => {
  return createMappedRelationship({
    _class: RelationshipClass.HAS,
    _type: MappedRelationships.VLAN_HAS_CLIENT._type,
    _key: createNetworkVlanHasClientKey(sourceEntity._key, client.id),
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
