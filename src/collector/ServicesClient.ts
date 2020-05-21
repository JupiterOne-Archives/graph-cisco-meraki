import meraki = require('meraki');
import { promisfy } from 'promisfy';
import {
  MerakiOrganization,
  MerakiNetwork,
  MerakiVlan,
  MerakiAdminUser,
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
    const getOrganizations = promisfy(
      meraki.OrganizationsController.getOrganizations,
    );
    const res: object[] = await getOrganizations();
    return res[0] as MerakiOrganization[];
  }

  /**
   * Get Admin Users of an Organization
   */
  async getAdmins(organizationId: string): Promise<MerakiAdminUser[]> {
    const getOrganizationAdmins = promisfy(
      meraki.AdminsController.getOrganizationAdmins,
    );
    const res: object[] = await getOrganizationAdmins(organizationId);
    return res[0] as MerakiAdminUser[];
  }

  /**
   * Get SAML Roles of an Organization
   */
  async getSamlRoles(organizationId: string): Promise<MerakiSamlRole[]> {
    const getOrganizationSamlRoles = promisfy(
      meraki.SAMLRolesController.getOrganizationSamlRoles,
    );
    const res: object[] = await getOrganizationSamlRoles(organizationId);
    return res[0] as MerakiSamlRole[];
  }

  /**
   * Get Networks of an Organization
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
   * Get VLANs in a Network
   */
  async getVlans(networkId: string): Promise<MerakiVlan[]> {
    const getNetworkVlans = promisfy(meraki.VlansController.getNetwork_vlans);
    const res: object[] = await getNetworkVlans(networkId);
    return res[0] as MerakiVlan[];
  }

  /**
   * Get Devices in a Network
   */
  async getDevices(networkId: string): Promise<MerakiDevice[]> {
    const getNetworkDevices = promisfy(
      meraki.DevicesController.getNetworkDevices,
    );
    const res: object[] = await getNetworkDevices(networkId);
    return res[0] as MerakiDevice[];
  }

  /**
   * Get SSIDs of a Wireless Network
   */
  async getSSIDs(networkId: string): Promise<MerakiSSID[]> {
    const getNetworkSSIDs = promisfy(meraki.SsidsController.getNetwork_ssids);
    const res: object[] = await getNetworkSSIDs(networkId);
    return res[0] as MerakiSSID[];
  }
}
