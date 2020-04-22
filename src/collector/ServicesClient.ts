import meraki = require('meraki');
import { promisfy } from 'promisfy';
import { MerakiOrganization, MerakiNetwork, MerakiVlan } from '.';

interface ServicesClientInput {
  apiKey: string;
}

/**
 * Services API
 *
 * ref: https://developer.cisco.com/meraki/api/#/rest/guides/node-js-sdk-quick-start
 */
export class ServicesClient {
  constructor({ apiKey }: ServicesClientInput) {
    meraki.Configuration.xCiscoMerakiAPIKey = apiKey;
  }

  /**
   * Get Organizations
   */
  async getOrganizations(): Promise<MerakiOrganization[]> {
    const getOrganizations = promisfy(
      meraki.OrganizationsController.getOrganizations,
    );
    const res: object[] = await getOrganizations();
    return res[0] as MerakiOrganization[];
  }

  /**
   * Get Networks
   */
  async getNetworks(organizationId: string): Promise<MerakiNetwork[]> {
    const getOrganizationNetworks = promisfy(
      meraki.NetworksController.getOrganizationNetworks,
    );
    const res: object[] = await getOrganizationNetworks({
      organizationId,
    });
    return res[0] as MerakiNetwork[];
  }

  /**
   * Get VLANs
   */
  async getVlans(networkId: string): Promise<MerakiVlan[]> {
    const getNetworkVlans = promisfy(meraki.VlansController.getNetwork_vlans);
    const res: object[] = await getNetworkVlans(networkId);
    return res[0] as MerakiVlan[];
  }
}
