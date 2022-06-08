import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
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
  logger: IntegrationLogger;
}

interface createAuthenticatedAPIRequestInput extends Partial<APIRequest> {
  url: string;
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
  private logger: IntegrationLogger;

  constructor({ apiKey, logger }: ServicesClientInput) {
    meraki.Configuration.xCiscoMerakiAPIKey = apiKey;
    this.client = new APIClient();
    this.apiKey = apiKey;
    this.logger = logger;
  }
  private createAuthenticatedAPIRequest(
    createAPIInput: createAuthenticatedAPIRequestInput,
  ): APIRequest {
    return {
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
      ...createAPIInput,
    };
  }

  async iterateAll<T>(
    url: string,
    iteratee: ResourceIteratee<T>,
  ): Promise<void> {
    const request: APIRequest = this.createAuthenticatedAPIRequest({
      url,
    });

    const response = await this.client.executeAPIRequest(request);

    for (const resource of response.data) {
      await iteratee(resource);
    }
  }

  async iterateDevices(
    networkId: string,
    iteratee: ResourceIteratee<MerakiDevice>,
  ): Promise<void> {
    const url = `${this.BASE_URL}/networks/${networkId}/devices`;
    await this.iterateAll(url, iteratee);
  }

  async iterateSamlRoles(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiSamlRole>,
  ): Promise<void> {
    const url = `${this.BASE_URL}/organizations/${organizationId}/samlRoles`;
    await this.iterateAll(url, iteratee);
  }

  async iterateNetworks(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiNetwork>,
  ): Promise<void> {
    const url = `${this.BASE_URL}/organizations/${organizationId}/networks`;
    await this.iterateAll(url, iteratee);
  }

  async iterateAdmins(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiAdminUser>,
  ): Promise<void> {
    const url = `${this.BASE_URL}/organizations/${organizationId}/admins`;
    await this.iterateAll(url, iteratee);
  }

  async iterateClients(
    networkId: string,
    iteratee: ResourceIteratee<MerakiClient>,
  ) {
    const url = `${this.BASE_URL}/networks/${networkId}/clients`;

    const request: APIRequest = this.createAuthenticatedAPIRequest({ url });

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
      } else {
        this.logger.debug(
          { url: url, status: err.status },
          'Skipping over failed request',
        );
      }
    }
  }

  async iterateSSIDs(
    networkId: string,
    iteratee: ResourceIteratee<MerakiSSID>,
  ): Promise<void> {
    const url = `${this.BASE_URL}/networks/${networkId}/wireless/ssids`;
    await this.iterateAll(url, iteratee);
  }

  async iterateVlans(
    networkId: string,
    iteratee: ResourceIteratee<MerakiVlan>,
  ): Promise<void> {
    const url = `${this.BASE_URL}/networks/${networkId}/appliance/vlans`;
    const request: APIRequest = this.createAuthenticatedAPIRequest({
      url,
    });

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
      // Ignore 400s because of possible product incompatibility
      if (err.status !== 400) {
        this.logger.debug(
          { url },
          'Unable to fetch VLANs. Likely due to non-MX network',
        );
        throw err;
      }
    }
  }

  /**
   * Get Organizations
   */
  async getOrganizations(): Promise<MerakiOrganization[]> {
    const request: APIRequest = this.createAuthenticatedAPIRequest({
      url: `${this.BASE_URL}/organizations`,
    });

    const response = await this.client.executeAPIRequest(request);

    return response.data;
  }
}
