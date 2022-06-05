import meraki = require('meraki');
import {
  MerakiOrganization,
  MerakiNetwork,
  MerakiVlan,
  MerakiAdminUser,
  MerakiClient,
  MerakiDevice,
  MerakiSamlRole,
  MerakiSSID,
} from '.';
import { APIClient } from '../client';
import { APIRequest } from '../client/types';

export type ResourceIteratee<T> = (resource: T) => void | Promise<void>;

export interface ServicesClientInput {
  apiKey: string;
}

/**
 * Services API
 *
 * ref: https://developer.cisco.com/meraki/api/#/rest/guides/node-js-sdk-quick-start
 */
export class ServicesClient {
  private BASE_URL = 'https://api.meraki.com/api/v1';
  private client: APIClient;
  private readonly apiKey: string;

  constructor({ apiKey }: ServicesClientInput) {
    meraki.Configuration.xCiscoMerakiAPIKey = apiKey;
    this.client = new APIClient();
    this.apiKey = apiKey;
  }

  async iterateOrganizations(
    iteratee: ResourceIteratee<MerakiOrganization>,
  ): Promise<void> {
    const request: APIRequest = {
      url: this.BASE_URL + '/organizations',
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);
    for (const organization of response.data) {
      await iteratee(organization);
    }
  }

  async iterateDevices(
    networkId: string,
    iteratee: ResourceIteratee<MerakiDevice>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/networks/${networkId}/devices`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);

    for (const device of response.data) {
      await iteratee(device);
    }
  }

  async iterateSamlRoles(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiSamlRole>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/organizations/${organizationId}/samlRoles`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);
    for (const samlRole of response.data) {
      await iteratee(samlRole);
    }
  }

  async iterateNetworks(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiNetwork>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/organizations/${organizationId}/networks`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);

    for (const network of response.data) {
      await iteratee(network);
    }
  }

  async iterateAdmins(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiAdminUser>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/organizations/${organizationId}/admins`,
      method: 'GET',
      headers: {
        'X-Cisco-Meraki-API-Key': this.apiKey,
      },
    };

    const response = await this.client.executeAPIRequest(request);
    for (const admin of response.data) {
      await iteratee(admin);
    }
  }

  async iterateClients(
    networkId: string,
    iteratee: ResourceIteratee<MerakiClient>,
  ) {
    const request: APIRequest = {
      url: `${this.BASE_URL}/networks/${networkId}/clients`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    try {
      const response = await this.client.executeAPIRequest(request);
      for (const client of response.data) {
        await iteratee(client);
      }
    } catch (err) {
      // This is specific logic in place from the first version of this integration
      // I think this is interesting and possibly the correct approach. However,
      // we don't have good patterns in place for partial failures.
      // Skipping over 404 and 400s is seen in other integrations, but often
      // we just throw an error and move on.
      if (err.status !== 400 || err.status !== 404) {
        throw err;
      }
    }
  }

  async iterateSSIDs(
    networkId: string,
    iteratee: ResourceIteratee<MerakiSSID>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/networks/${networkId}/wireless/ssids`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);
    for (const ssid of response.data) {
      await iteratee(ssid);
    }
  }

  async iterateVlans(
    networkId: string,
    iteratee: ResourceIteratee<MerakiVlan>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/networks/${networkId}/appliance/vlans`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    // TODO: @zemberdotnet
    // This is a hack around the fact that it's unclear how to distinguish
    // an MX network. When we receive a response on how to distinguish them
    // we should extract it into a utility function and add it into the actual
    // step to not hide this logic.
    try {
      const response = await this.client.executeAPIRequest(request);

      for (const vlan of response.data) {
        await iteratee(vlan);
      }
    } catch (err) {
      // Do nothing
    }
  }

  /**
   * Get Organizations
   */
  async getOrganizations(): Promise<MerakiOrganization[]> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/organizations`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);
    return response.data;
  }
}
