import {
  MerakiOrganization,
  MerakiNetwork,
  MerakiVlan,
  MerakiAdminUser,
  MerakiDevice,
  MerakiSamlRole,
  MerakiSSID,
} from '../collector';
import {
  createIntegrationEntity,
  convertProperties,
  getTime,
} from '@jupiterone/integration-sdk';
import createEntityKey from './utils/createEntityKey';

export const convertOrganization = (
  data: MerakiOrganization,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: createEntityKey('meraki_organization', data.id),
        _type: 'meraki_organization',
        _class: 'Organization',
        id: data.id,
        name: data.name,
        displayName: data.name,
        url: data.url,
      },
    },
  });

export const convertAdminUser = (
  data: MerakiAdminUser,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: createEntityKey('meraki_admin', data.id),
        _type: 'meraki_admin',
        _class: 'User',
        name: data.name,
        displayName: data.name,
        admin: true,
        mfaEnabled: data.twoFactorAuthEnabled,
        lastActive: getTime(data.lastActive),
        username: data.email,
      },
    },
  });

export const convertSamlRole = (
  data: MerakiSamlRole,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: createEntityKey('meraki_saml_role', data.id),
        _type: 'meraki_saml_role',
        _class: 'AccessRole',
        name: data.role,
        displayName: data.role,
      },
    },
  });

export const convertNetwork = (
  data: MerakiNetwork,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: createEntityKey('meraki_network', data.id),
        _type: 'meraki_network',
        _class: 'Site',
        id: data.id,
        name: data.name,
        displayName: data.name,
        organizationId: data.organizationId,
        timeZone: data.timeZone,
        type: data.type,
      },
    },
  });

export const convertSSID = (
  data: MerakiSSID,
  networkId: string,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: createEntityKey(
          'meraki_wifi',
          `${networkId}:${data.number}:${data.name}`,
        ),
        _type: 'meraki_wifi',
        _class: 'Network',
        name: data.name,
        displayName: data.name,
        type: 'wireless',
        encrypted: !!data.encryptionMode,
        public: data.authMode === 'open',
        internal: data.authMode !== 'open',
        guest: !!data.name.match(/guest/i),
        CIDR: '255.255.255.255', // CIDR is required by data model
      },
    },
  });

export const convertVlan = (
  data: MerakiVlan,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: createEntityKey('meraki_vlan', `${data.networkId}:${data.id}`),
        _type: 'meraki_vlan',
        _class: 'Network',
        id: `${data.networkId}:${data.id}`,
        vlanId: data.id,
        name: data.name,
        displayName: data.name,
        CIDR: data.subnet,
        defaultGateway: data.applianceIp,
        internal: true,
        dmz: !!data.name.match(/dmz/i),
        public: !!data.name.match(/dmz|public/i),
        wireless: !!data.name.match(/wireless|wifi/i),
      },
    },
  });

export const convertDevice = (
  data: MerakiDevice,
): ReturnType<typeof createIntegrationEntity> =>
  createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: createEntityKey(
          'meraki_device',
          `${data.networkId}:${data.mac || data.serial}`,
        ),
        _type: 'meraki_device',
        _class: ['Host', 'Device'],
        category: 'network',
        make: 'Cisco Meraki',
        name: data.name,
        displayName: data.name,
        hostname: data.name,
        ipAddress: data.lanIp,
        privateIp: data.lanIp,
        privateIpAddress: data.lanIp,
      },
    },
  });
