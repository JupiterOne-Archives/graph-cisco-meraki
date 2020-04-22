import {
  IntegrationStep,
  IntegrationStepExecutionContext,
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
    await jobState.addEntities(orgs.map(convertOrganization));

    for (const org of orgs) {
      const networks = await client.getNetworks(org.id);
      await jobState.addEntities(networks.map(convertNetwork));

      for (const network of networks) {
        if (network.id.startsWith('L_')) {
          const vlans = await client.getVlans(network.id);
          await jobState.addEntities(vlans.map(convertVlan));
        }
      }
    }
  },
};

export default step;
