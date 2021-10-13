import { RelationshipClass } from '@jupiterone/data-model';
import { RelationshipDirection } from '@jupiterone/integration-sdk-core';

export const StepIds = {
  FETCH_RESOURCES: 'fetch-resources',
  FETCH_CLIENTS: 'fetch-clients',
};

export const Entities = {
  ACCOUNT: {
    // not in jupiterone.md
    resourceName: 'Account',
    _type: 'cisco_meraki_account',
    _class: 'Account',
  },
  ORGANIZATION: {
    resourceName: 'Organization',
    _type: 'meraki_organization',
    _class: 'Organization',
  },
  ADMIN: {
    resourceName: 'Admin',
    _type: 'meraki_admin',
    _class: 'User',
  },
  SAML_ROLE: {
    resourceName: 'SAML Role',
    _type: 'meraki_saml_role',
    _class: 'AccessRole',
  },
  NETWORK: {
    resourceName: 'Network',
    _type: 'meraki_network',
    _class: 'Site',
  },
  WIFI: {
    resourceName: 'SSID',
    _type: 'meraki_wifi',
    _class: 'Network',
  },
  VLAN: {
    resourceName: 'VLAN',
    _type: 'meraki_vlan',
    _class: 'Network',
  },
  DEVICE: {
    resourceName: 'Device',
    _type: 'meraki_device',
    _class: ['Device', 'Host'],
  },
};

export const Relationships = {
  ACCOUNT_HAS_ORGANIZATION: {
    _type: 'cisco_meraki_account_has_meraki_organization',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.ORGANIZATION._type,
  },
  ORGANIZATION_HAS_ADMIN: {
    _type: 'meraki_organization_has_admin',
    sourceType: Entities.ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.ADMIN._type,
  },
  ORGANIZATION_HAS_SAML_ROLE: {
    _type: 'meraki_organization_has_saml_role',
    sourceType: Entities.ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.SAML_ROLE._type,
  },
  ORGANIZATION_HAS_NEWTORK: {
    _type: 'meraki_organization_has_network',
    sourceType: Entities.ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.NETWORK._type,
  },
  NETWORK_HAS_DEVICE: {
    _type: 'meraki_network_has_device',
    sourceType: Entities.NETWORK._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.DEVICE._type,
  },
  NETWORK_HAS_VLAN: {
    _type: 'meraki_network_has_vlan',
    sourceType: Entities.NETWORK._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.VLAN._type,
  },
  NETWORK_HAS_WIFI: {
    _type: 'meraki_network_has_wifi',
    sourceType: Entities.NETWORK._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.WIFI._type,
  },
};

export const TargetEntities = {
  INTERNET: {
    resourceName: 'Internet',
    _type: 'internet',
    _class: ['Internet', 'Network'],
  },
  CLIENT: {
    reourceName: 'Client',
    _type: 'host',
    _class: ['Device', 'Host'],
  },
};

export const MappedRelationships = {
  DEVICE_CONNECTS_INTERNET: {
    _type: 'meraki_device_connects_internet',
    sourceType: Entities.DEVICE._type,
    _class: RelationshipClass.CONNECTS,
    targetType: 'internet',
    direction: RelationshipDirection.FORWARD,
  },
  NETWORK_HAS_CLIENT: {
    _type: 'meraki_network_has_client',
    sourceType: Entities.NETWORK._type,
    _class: RelationshipClass.HAS,
    targetType: 'host',
    direction: RelationshipDirection.FORWARD,
  },
  VLAN_HAS_CLIENT: {
    _type: 'meraki_vlan_has_client',
    sourceType: Entities.VLAN._type,
    _class: RelationshipClass.HAS,
    targetType: 'host',
    direction: RelationshipDirection.FORWARD,
  },
};