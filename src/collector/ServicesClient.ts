import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
  IntegrationProviderAuthenticationError,
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
import { GaxiosError, request } from 'gaxios';
import parse from 'parse-link-header';

export type ResourceIteratee<T> = (resource: T) => void | Promise<void>;

export interface ServicesClientInput {
  apiKey: string;
  logger: IntegrationLogger;
}

type ErrorHandler = (err: any) => void;

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

  private defaultErrorHandling(err: any) {
    if (err instanceof GaxiosError) {
      throw this.createIntegrationError(
        err.response?.status as number,
        err.response?.statusText as string,
        err.config?.url as string,
      );
    } else {
      throw err;
    }
  }

  async iterateAll<T>(
    url: string,
    iteratee: ResourceIteratee<T>,
    params?: any,
    errorHandler?: ErrorHandler,
  ): Promise<void> {
    let nextUrl: string | undefined = this.BASE_URL + url;

    do {
      try {
        const response = await request<T[]>({
          url: nextUrl,
          params: params,
          responseType: 'json',
          timeout: 60_000,
          headers: {
            'X-Cisco-Meraki-API-Key': this.apiKey,
          },
        });

        // after the first request the link header will contain
        // the params we need
        params = undefined;

        for (const resource of response.data) {
          await iteratee(resource);
        }

        const parsedLinkHeader = parse(response.headers.link);
        nextUrl = parsedLinkHeader?.next?.url;
      } catch (err) {
        const parsedLinkHeader = parse(err.response?.headers?.link);
        nextUrl = parsedLinkHeader?.next?.url;
        errorHandler ? errorHandler(err) : this.defaultErrorHandling(err);
      }
    } while (nextUrl);
  }

  private createIntegrationError(
    status: number,
    statusText: string,
    endpoint: string,
  ) {
    switch (status) {
      case 401:
        return new IntegrationProviderAuthenticationError({
          status,
          statusText,
          endpoint,
        });
      case 403:
        return new IntegrationProviderAuthorizationError({
          status,
          statusText,
          endpoint,
        });
      default:
        return new IntegrationProviderAPIError({
          status,
          statusText,
          endpoint,
        });
    }
  }

  /**
   * iterateDevices iterates all devices in a network
   * @url https://developer.cisco.com/meraki/api-v1/#!get-network-devices
   * @paginated false
   * @param networkId the network id
   * @param iteratee  the iteratee callback function
   */
  async iterateDevices(
    networkId: string,
    iteratee: ResourceIteratee<MerakiDevice>,
  ): Promise<void> {
    const url = `/networks/${networkId}/devices`;
    await this.iterateAll(url, iteratee);
  }

  /**
   * iterateSamlRoles iterates all SAML roles in a network
   * @url https://developer.cisco.com/meraki/api-v1/#!get-organization-saml-roles
   * @paginated false
   * @param organizationId the organization id
   * @param iteratee  the iteratee callback function
   */
  async iterateSamlRoles(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiSamlRole>,
  ): Promise<void> {
    const url = `/organizations/${organizationId}/samlRoles`;
    await this.iterateAll(url, iteratee);
  }

  /**
   * iterateNetworks iterates all networks in an organization
   * @url https://developer.cisco.com/meraki/api-v1/#!get-organization-networks
   * @paginated true
   * @param organizationId the organization id
   * @param iteratee  the iteratee callback function
   */
  async iterateNetworks(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiNetwork>,
  ): Promise<void> {
    const url = `/organizations/${organizationId}/networks`;

    await this.iterateAll(url, iteratee, { perPage: 50 });
  }

  /**
   * iterateAdmins iterates all admins in a network
   * @url https://developer.cisco.com/meraki/api-v1/#!get-organization-admins
   * @paginated false
   * @param organizationId the organization id
   * @param iteratee  the iteratee callback function
   */
  async iterateAdmins(
    organizationId: string,
    iteratee: ResourceIteratee<MerakiAdminUser>,
  ): Promise<void> {
    const url = `/organizations/${organizationId}/admins`;
    await this.iterateAll(url, iteratee);
  }

  /**
   * iterateClients iterates all clients in a network
   * @url https://developer.cisco.com/meraki/api-v1/#!get-network-clients
   * @paginated true
   * @param networkId the network id
   * @param iteratee the iteratee callback function
   */
  async iterateClients(
    networkId: string,
    iteratee: ResourceIteratee<MerakiClient>,
  ) {
    const url = `/networks/${networkId}/clients`;

    const errHandler: ErrorHandler = (err: any) => {
      if (err instanceof GaxiosError) {
        if (err.response?.status === 400 || err.response?.status === 404) {
          this.logger.info(
            { url: err.config.url, status: err.response.status },
            'Skipping over failed request',
          );
          return;
        } else {
          throw this.createIntegrationError(
            err.response?.status as number,
            err.response?.statusText as string,
            err.config.url as string,
          );
        }
      } else {
        throw err;
      }
    };

    await this.iterateAll(url, iteratee, { perPage: 50 }, errHandler);
  }

  /**
   * iterateSSIDs iterates all SSIDs in a network
   * @url https://developer.cisco.com/meraki/api-v1/#!get-network-wireless-ssids
   * @paginated false
   * @param networkId the network id
   * @param iteratee the iteratee callback function
   */
  async iterateSSIDs(
    networkId: string,
    iteratee: ResourceIteratee<MerakiSSID>,
  ): Promise<void> {
    const url = `/networks/${networkId}/wireless/ssids`;
    await this.iterateAll(url, iteratee);
  }

  /**
   * iterateVlans iterates all vlans in a network
   * @url https://developer.cisco.com/meraki/api-v1/#!get-network-appliance-vlans
   * @paginated false
   * @param networkId the network id
   * @param iteratee  the iteratee callback function
   */
  async iterateVlans(
    networkId: string,
    iteratee: ResourceIteratee<MerakiVlan>,
  ): Promise<void> {
    const url = `/networks/${networkId}/appliance/vlans`;

    const errHandler = (err: any) => {
      if (err instanceof GaxiosError) {
        if (err.response?.status === 400) {
          this.logger.debug(
            { url },
            'Unable to fetch VLANs. Likely due to non-MX network',
          );
          return;
        } else {
          throw this.createIntegrationError(
            err.response?.status as number,
            err.response?.statusText as string,
            err.config?.url as string,
          );
        }
      } else {
        throw err;
      }
    };

    await this.iterateAll(url, iteratee, undefined, errHandler);
  }

  /**
   * Get Organizations
   * @url https://developer.cisco.com/meraki/api-v1/#!get-organizations
   * @paginated false
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
