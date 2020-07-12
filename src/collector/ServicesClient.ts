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

export interface ServicesClientInput {
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
    const res: object[] = await meraki.OrganizationsController.getOrganizations();
    return res as MerakiOrganization[];
  }

  /**
   * Get Admin Users of an Organization
   */
  async getAdmins(organizationId: string): Promise<MerakiAdminUser[]> {
    const res: object[] = await meraki.AdminsController.getOrganizationAdmins(
      organizationId,
    );
    return res as MerakiAdminUser[];
  }

  /**
   * Get SAML Roles of an Organization
   */
  async getSamlRoles(organizationId: string): Promise<MerakiSamlRole[]> {
    const res: object[] = await meraki.SAMLRolesController.getOrganizationSamlRoles(
      organizationId,
    );
    return res as MerakiSamlRole[];
  }

  /**
   * Get Networks of an Organization
   */
  async getNetworks(organizationId: string): Promise<MerakiNetwork[]> {
    const res: object[] = await meraki.NetworksController.getOrganizationNetworks(
      {
        organizationId,
      },
    );
    return res as MerakiNetwork[];
  }

  /**
   * Get VLANs in a Network
   */
  async getVlans(networkId: string): Promise<MerakiVlan[]> {
    const res: object[] = await meraki.VlansController.getNetwork_vlans(
      networkId,
    );
    return res as MerakiVlan[];
  }

  /**
   * Get Devices in a Network
   */
  async getDevices(networkId: string): Promise<MerakiDevice[]> {
    const res: object[] = await meraki.DevicesController.getNetworkDevices(
      networkId,
    );
    return res as MerakiDevice[];
  }

  /**
   * Get Clients in a Network
   */
  async getClients(networkId: string): Promise<MerakiClient[]> {
    const res: object[] = await meraki.ClientsController.getNetworkClients({
      networkId,
    });
    return res as MerakiClient[];
  }

  /**
   * Get SSIDs of a Wireless Network
   */
  async getSSIDs(networkId: string): Promise<MerakiSSID[]> {
    const res: object[] = await meraki.SsidsController.getNetwork_ssids(
      networkId,
    );
    return res as MerakiSSID[];
  }
}
