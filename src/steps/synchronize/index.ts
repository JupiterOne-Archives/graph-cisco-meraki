import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';

import { createServicesClient } from '../../collector';
import {
  convertOrganization,
  convertNetwork,
  convertVlan,
  convertAdminUser,
  convertDevice,
  convertSamlRole,
} from '../../converter';

const step: IntegrationStep = {
  id: 'synchronize',
  name: 'Fetch Meraki Organizations, Networks, and Devices',
  types: [
    'meraki_organization',
    'meraki_network',
    'meraki_device',
    'meraki_vlan',
  ],
  async executionHandler({
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const client = createServicesClient(instance);

    const orgs = await client.getOrganizations();
    const orgEntities = orgs.map(convertOrganization);
    await jobState.addEntities(orgEntities);

    for (const org of orgEntities) {
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
  },
};

export default step;
