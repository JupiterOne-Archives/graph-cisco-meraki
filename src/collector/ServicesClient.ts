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

  async iterateVlans(
    networkId: string,
    iteratee: ResourceIteratee<MerakiVlan>,
  ): Promise<void> {
    const request: APIRequest = {
      url: `${this.BASE_URL}/networks/${networkId}/appliance/vlans`,
      method: 'GET',
      headers: { 'X-Cisco-Meraki-API-Key': this.apiKey },
    };

    const response = await this.client.executeAPIRequest(request);
    for (const vlan of response.data) {
      await iteratee(vlan);
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

  /**
   * Get Admin Users of an Organization
   */
  async getAdmins(organizationId: string): Promise<MerakiAdminUser[]> {
    const res = await meraki.AdminsController.getOrganizationAdmins(
      organizationId,
    );
    return res as MerakiAdminUser[];
  }

  /**
   * Get SAML Roles of an Organization
   */
  async getSamlRoles(organizationId: string): Promise<MerakiSamlRole[]> {
    const res = await meraki.SAMLRolesController.getOrganizationSamlRoles(
      organizationId,
    );
    return res as MerakiSamlRole[];
  }

  /**
   * Get Networks of an Organization
   */
  async getNetworks(organizationId: string): Promise<MerakiNetwork[]> {
    const res = await meraki.NetworksController.getOrganizationNetworks({
      organizationId,
    });
    return res as MerakiNetwork[];
  }

  /**
   * Get VLANs in a Network
   */
  async getVlans(networkId: string): Promise<MerakiVlan[]> {
    const enabledResponse = await meraki.VlansController.getNetwork_vlans_EnabledState(
      networkId,
    );

    // some networks may not have VLANs enabled.
    // https://community.meraki.com/t5/Security-SD-WAN/MX-device-ports/m-p/102185
    // https://community.cisco.com/t5/other-cloud-subjects/meraki-unable-to-get-vlan-info/td-p/4089912
    // if Vlans aren't enabled we shouldn't try to get them
    if (enabledResponse?.enabled === false) {
      return [] as MerakiVlan[];
    }

    const res = await meraki.VlansController.getNetwork_vlans(networkId);
    return res as MerakiVlan[];
  }

  /**
   * Get Devices in a Network
   */
  async getDevices(networkId: string): Promise<MerakiDevice[]> {
    const res = await meraki.DevicesController.getNetworkDevices(networkId);
    return res as MerakiDevice[];
  }

  /**
   * Get Clients in a Network
   */
  async getClients(networkId: string): Promise<MerakiClient[]> {
    const res = await meraki.ClientsController.getNetworkClients({
      networkId,
    });
    return res as MerakiClient[];
  }

  /**
   * Get SSIDs of a Wireless Network
   */
  async getSSIDs(networkId: string): Promise<MerakiSSID[]> {
    const res = await meraki.SsidsController.getNetwork_ssids(networkId);
    return res as MerakiSSID[];
  }
}
