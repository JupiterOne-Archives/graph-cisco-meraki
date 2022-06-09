import {
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';
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
import { request } from 'gaxios';

export type ResourceIteratee<T> = (resource: T) => void | Promise<void>;

export interface ServicesClientInput {
  apiKey: string;
  logger: IntegrationLogger;
}

/**
 * Services API
 *
 * ref: https://developer.cisco.com/meraki/api/#/rest/guides/node-js-sdk-quick-start
 */
export class ServicesClient {
  private BASE_URL = 'https://api.meraki.com/api/v1';
  private readonly apiKey: string;
  private logger: IntegrationLogger;

  constructor({ apiKey, logger }: ServicesClientInput) {
    this.apiKey = apiKey;
    this.logger = logger;
  }

  async iterateAll<T>(
    url: string,
    iteratee: ResourceIteratee<T>,
  ): Promise<void> {
    try {
      const response = await request<T[]>({
        baseURL: this.BASE_URL,
        url: url,
        responseType: 'json',
        headers: {
          'X-Cisco-Meraki-API-Key': this.apiKey,
        },
      });

      for (const resource of response.data) {
        await iteratee(resource);
      }
    } catch (err) {
      throw new IntegrationProviderAPIError({
        endpoint: this.BASE_URL + url,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
    }
  }

  async iterateDevices(
    networkId: string,
    iteratee: ResourceIteratee<MerakiDevice>,
  ): Promise<void> {
    const url = `/networks/${networkId}/devices`;
    await this.iterateAll(url, iteratee);
  }

  async iterateSamlRoles(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiSamlRole>,
  ): Promise<void> {
    const url = `/organizations/${organizationId}/samlRoles`;
    await this.iterateAll(url, iteratee);
  }

  async iterateNetworks(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiNetwork>,
  ): Promise<void> {
    const url = `/organizations/${organizationId}/networks`;
    await this.iterateAll(url, iteratee);
  }

  async iterateAdmins(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiAdminUser>,
  ): Promise<void> {
    const url = `/organizations/${organizationId}/admins`;
    await this.iterateAll(url, iteratee);
  }

  async iterateClients(
    networkId: string,
    iteratee: ResourceIteratee<MerakiClient>,
  ) {
    const url = `/networks/${networkId}/clients`;

    try {
      const response = await request<MerakiClient[]>({
        baseURL: this.BASE_URL,
        url: url,
        responseType: 'json',
        headers: {
          'X-Cisco-Meraki-API-Key': this.apiKey,
        },
      });
      for (const client of response.data) {
        await iteratee(client);
      }
    } catch (err) {
      // This is specific logic in place from the first version of this integration
      // I think this is interesting and possibly the correct approach. However,
      // we don't have good patterns in place for partial failures.
      // Skipping over 404 and 400s is seen in other integrations, but often
      // we just throw an error and move on.
      if (err.response.status !== 400 || err.response.status !== 404) {
        throw new IntegrationProviderAPIError({
          endpoint: this.BASE_URL + url,
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
      } else {
        this.logger.info(
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
    const url = `/networks/${networkId}/wireless/ssids`;
    await this.iterateAll(url, iteratee);
  }

  async iterateVlans(
    networkId: string,
    iteratee: ResourceIteratee<MerakiVlan>,
  ): Promise<void> {
    const url = `/networks/${networkId}/appliance/vlans`;

    // TODO: @zemberdotnet
    // This is a hack around the fact that it's unclear how to distinguish
    // an MX network. When we receive a response on how to distinguish them
    // we should extract it into a utility function and add it into the actual
    // step to not hide this logic.
    try {
      const response = await request<MerakiVlan[]>({
        baseURL: this.BASE_URL,
        url: url,
        responseType: 'json',
        headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
      });

      for (const vlan of response.data) {
        await iteratee(vlan);
      }
    } catch (err) {
      // Ignore 400s because of possible product incompatibility
      if (err.response.status !== 400) {
        this.logger.debug(
          { url },
          'Unable to fetch VLANs. Likely due to non-MX network',
        );
        throw new IntegrationProviderAPIError({
          endpoint: this.BASE_URL + url,
          status: err.response?.status,
          statusText: err.response?.statusText,
        });
      }
    }
  }

  /**
   * Get Organizations
   */
  async getOrganizations(): Promise<MerakiOrganization[]> {
    try {
      const response = await request<MerakiOrganization[]>({
        baseURL: this.BASE_URL,
        url: '/organizations',
        responseType: 'json',
        headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
      });
      return response.data;
    } catch (err) {
      throw new IntegrationProviderAPIError({
        endpoint: this.BASE_URL + '/organizations',
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
    }
  }
}
