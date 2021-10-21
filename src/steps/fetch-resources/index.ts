import { IntegrationConfig } from '../../types';

import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { INTERNET } from '@jupiterone/data-model';

import { createServicesClient } from '../../collector';
import {
  convertAccount,
  convertAdminUser,
  convertDevice,
  convertNetwork,
  convertOrganization,
  convertSamlRole,
  convertSSID,
  convertVlan,
} from '../../converter';
import {
  Entities,
  MappedRelationships,
  Relationships,
  StepIds,
} from '../../constants';

const step: IntegrationStep<IntegrationConfig> = {
  id: StepIds.FETCH_RESOURCES,
  name: 'Fetch Meraki Organizations, Users, Networks, and Devices',
  entities: [
    Entities.ACCOUNT,
    Entities.ORGANIZATION,
    Entities.ADMIN,
    Entities.SAML_ROLE,
    Entities.NETWORK,
    Entities.DEVICE,
    Entities.VLAN,
    Entities.WIFI,
  ],
  relationships: [
    Relationships.ACCOUNT_HAS_ORGANIZATION,
    Relationships.ORGANIZATION_HAS_ADMIN,
    Relationships.ORGANIZATION_HAS_SAML_ROLE,
    Relationships.ORGANIZATION_HAS_NEWTORK,
    Relationships.NETWORK_HAS_DEVICE,
    Relationships.NETWORK_HAS_VLAN,
    Relationships.NETWORK_HAS_WIFI,
  ],
  mappedRelationships: [MappedRelationships.DEVICE_CONNECTS_INTERNET],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const client = createServicesClient(instance);

    const orgs = await client.getOrganizations();
    const orgEntities = orgs.map(convertOrganization);
    await jobState.addEntities(orgEntities);

    const accountEntity = convertAccount(orgs[0]);
    const accountOrgRelationships: Relationship[] = [];
    await jobState.addEntities([accountEntity]);

    for (const org of orgEntities) {
      accountOrgRelationships.push(
        createDirectRelationship({
          from: accountEntity,
          to: org,
          _class: RelationshipClass.HAS,
        }),
      );

      const networks = await client.getNetworks(org.id);
      const networkEntities = networks.map(convertNetwork);
      await jobState.addEntities(networkEntities);

      const orgNetworkRelationships = networkEntities.map((net) =>
        createDirectRelationship({
          from: org,
          to: net,
          _class: RelationshipClass.HAS,
        }),
      );
      await jobState.addRelationships(orgNetworkRelationships);

      for (const network of networkEntities) {
        const devices = await client.getDevices(network.id);
        const deviceEntities = devices.map(convertDevice);
        await jobState.addEntities(deviceEntities);

        const networkDeviceRelationships = deviceEntities.map((device) =>
          createDirectRelationship({
            from: network,
            to: device,
            _class: RelationshipClass.HAS,
          }),
        );
        await jobState.addRelationships(networkDeviceRelationships);

        const internetDeviceRelationships: Relationship[] = [];
        deviceEntities.forEach((device) => {
          if (device.publicIp) {
            internetDeviceRelationships.push(
              createMappedRelationship({
                _class: MappedRelationships.DEVICE_CONNECTS_INTERNET._class,
                _type: MappedRelationships.DEVICE_CONNECTS_INTERNET._type,
                _mapping: {
                  relationshipDirection: RelationshipDirection.FORWARD,
                  sourceEntityKey: device._key,
                  targetFilterKeys: [['_type', '_key']],
                  targetEntity: INTERNET,
                },
              }),
            );
          }
        });
        await jobState.addRelationships(internetDeviceRelationships);

        if (network.id.startsWith('L_')) {
          const vlans = await client.getVlans(network.id);
          const vlanEntities = vlans.map(convertVlan);
          await jobState.addEntities(vlanEntities);

          const networkVlanRelationships = vlanEntities.map((vlan) =>
            createDirectRelationship({
              from: network,
              to: vlan,
              _class: RelationshipClass.HAS,
            }),
          );
          await jobState.addRelationships(networkVlanRelationships);
        }

        if (network.type === 'wireless') {
          const ssids = await client.getSSIDs(network.id);
          const ssidEntities: Entity[] = [];
          ssids.forEach((ssid) => {
            if (!ssid.name.startsWith('Unconfigured')) {
              ssid.psk = 'REDACTED';
              const entity = convertSSID(ssid, network.id);
              delete entity.CIDR; // deletes '255.255.255.255' placeholder CIDR
              ssidEntities.push(entity);
            }
          });
          await jobState.addEntities(ssidEntities);

          const networkSSIDRelationships = ssidEntities.map((ssid) =>
            createDirectRelationship({
              from: network,
              to: ssid,
              _class: RelationshipClass.HAS,
            }),
          );
          await jobState.addRelationships(networkSSIDRelationships);
        }
      }

      const admins = await client.getAdmins(org.id);
      const adminEntities = admins.map(convertAdminUser);
      await jobState.addEntities(adminEntities);

      const orgAdminRelationships = adminEntities.map((admin) =>
        createDirectRelationship({
          from: org,
          to: admin,
          _class: RelationshipClass.HAS,
        }),
      );
      await jobState.addRelationships(orgAdminRelationships);

      const samlRoles = await client.getSamlRoles(org.id);
      const samlRolesEntities = samlRoles.map(convertSamlRole);
      await jobState.addEntities(samlRolesEntities);

      const orgSamlRoleRelationships = samlRolesEntities.map((role) =>
        createDirectRelationship({
          from: org,
          to: role,
          _class: RelationshipClass.HAS,
        }),
      );
      await jobState.addRelationships(orgSamlRoleRelationships);
    }

    await jobState.addRelationships(accountOrgRelationships);
  },
};

export default step;
