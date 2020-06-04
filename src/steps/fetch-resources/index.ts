import { IntegrationConfig } from '../../types';

import {
  createIntegrationRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk';

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

export const STEP_ID = 'fetch-resources';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch Meraki Organizations, Users, Networks, and Devices',
  types: [
    'meraki_organization',
    'meraki_admin',
    'meraki_saml_role',
    'meraki_network',
    'meraki_device',
    'meraki_vlan',
    'meraki_wifi',
    'cisco_meraki_account_has_meraki_organization',
    'meraki_organization_has_admin',
    'meraki_organization_has_saml_role',
    'meraki_organization_has_network',
    'meraki_network_has_device',
    'meraki_network_has_vlan',
  ],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext<IntegrationConfig>) {
    const client = createServicesClient(instance);

    const orgs = await client.getOrganizations();
    const orgEntities = orgs.map(convertOrganization);
    await jobState.addEntities(orgEntities);

    const accountEntity = convertAccount(orgs[0]);
    const accountOrgRelationships = [];
    await jobState.addEntities([accountEntity]);

    for (const org of orgEntities) {
      accountOrgRelationships.push(
        createIntegrationRelationship({
          from: accountEntity,
          to: org,
          _class: 'HAS',
        }),
      );

      const networks = await client.getNetworks(org.id);
      const networkEntities = networks.map(convertNetwork);
      await jobState.addEntities(networkEntities);

      const orgNetworkRelationships = networkEntities.map((net) =>
        createIntegrationRelationship({
          from: org,
          to: net,
          _class: 'HAS',
        }),
      );
      await jobState.addRelationships(orgNetworkRelationships);

      for (const network of networkEntities) {
        const devices = await client.getDevices(network.id);
        const deviceEntities = devices.map(convertDevice);
        await jobState.addEntities(deviceEntities);

        const networkDeviceRelationships = deviceEntities.map((device) =>
          createIntegrationRelationship({
            from: network,
            to: device,
            _class: 'HAS',
          }),
        );
        await jobState.addRelationships(networkDeviceRelationships);

        if (network.id.startsWith('L_')) {
          const vlans = await client.getVlans(network.id);
          const vlanEntities = vlans.map(convertVlan);
          await jobState.addEntities(vlanEntities);

          const networkVlanRelationships = vlanEntities.map((vlan) =>
            createIntegrationRelationship({
              from: network,
              to: vlan,
              _class: 'HAS',
            }),
          );
          await jobState.addRelationships(networkVlanRelationships);
        }

        if (network.type === 'wireless') {
          const ssids = await client.getSSIDs(network.id);
          const ssidEntities = [];
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
            createIntegrationRelationship({
              from: network,
              to: ssid,
              _class: 'HAS',
            }),
          );
          await jobState.addRelationships(networkSSIDRelationships);
        }
      }

      const admins = await client.getAdmins(org.id);
      const adminEntities = admins.map(convertAdminUser);
      await jobState.addEntities(adminEntities);

      const orgAdminRelationships = adminEntities.map((admin) =>
        createIntegrationRelationship({
          from: org,
          to: admin,
          _class: 'HAS',
        }),
      );
      await jobState.addRelationships(orgAdminRelationships);

      const samlRoles = await client.getSamlRoles(org.id);
      const samlRolesEntities = samlRoles.map(convertSamlRole);
      await jobState.addEntities(samlRolesEntities);

      const orgSamlRoleRelationships = samlRolesEntities.map((role) =>
        createIntegrationRelationship({
          from: org,
          to: role,
          _class: 'HAS',
        }),
      );
      await jobState.addRelationships(orgSamlRoleRelationships);
    }

    await jobState.addRelationships(accountOrgRelationships);
  },
};

export default step;
