import { MerakiOrganization, MerakiNetwork, MerakiVlan } from '../collector';
import {
  createIntegrationEntity,
  convertProperties,
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
        name: data.name,
        displayName: data.name,
        CIDR: data.subnet,
        defaultGateway: data.applianceIp,
        internal: true,
        public: !!data.name.match(/dmz|public/i),
        wireless: !!data.name.match(/wireless|wifi/i),
      },
    },
  });
