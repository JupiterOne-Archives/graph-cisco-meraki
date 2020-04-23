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
    }
  },
};

export default step;
