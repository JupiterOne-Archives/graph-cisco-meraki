export type MerakiOrganization = {
  id: string;
  name: string;
  url: string;
  api: { enabled: boolean };
  licensing?: { model?: string };
  cloud?: {
    region?: {
      name: string;
    };
  };
};
export type MerakiAdminUser = {
  id: string;
  name: string;
  email: string;
  orgAccess: string;
  accountStatus: string;
  twoFactorAuthEnabled: boolean;
  hasApiKey: boolean;
  lastActive: string; // maybe Time?
  tags: {
    tag: string;
    [key: string]: string;
  }[];
  networks: {
    id: string;
    [key: string]: string | number | boolean; // uncertain about this type
  }[];
  authenticationMethod: string;
};

export type MerakiSamlRole = {
  id: string;
  role: string;
  orgAccess: string;
  networks: {
    id: string;
    [key: string]: string | number | boolean; // uncertain about this type
  }[];
  tags: {
    tag: string;
    [key: string]: string | number | boolean; // uncertain about this type
  }[];
};

export type MerakiNetwork = {
  id: string;
  organizationId: string;
  name: string;
  timeZone: string;
  tags: string[];
  productTypes: string[];
  enrollmentString: string;
  notes: string; // new in v1
  isBoundToConfigTemplate: boolean; // new in v1
};

/*
    New properties in v1:
 {
        "namedVlan": "Named Vlan",
        "adaptivePolicyGroup": null,
        "deviceTypePrediction": "iPhone SE, iOS9.3.5",
        "recentDeviceConnection": "Wired",
 }

 */
export type MerakiClient = {
  usage: { sent: number; recv: number };
  id: string;
  description: string;
  mac: string;
  ip: string;
  user: string;
  vlan: string;
  namedVlan: string;
  switchport: string | null;
  adaptivePolicyGroup: string | null;
  ip6: string;
  firstSeen: number;
  lastSeen: number;
  manufacturer: string;
  os: string;
  deviceTypePrediction: string;
  recentDeviceSerial: string;
  recentDeviceName: string;
  recentDeviceMac: string;
  recentDeviceConnection: string;
  ssid: string;
  status: string;
  notes: string;
  ip6Local: string;
  smInstalled: boolean;
  groupPolicy8021x: string;
};

export type MerakiDevice = {
  name: string;
  lat: number;
  lng: number;
  serial: string;
  mac: string;
  model: string;
  address: string;
  notes: string;
  lanIp: string;
  wanIp?: string;
  wan1Ip?: string;
  wan2Ip?: string;
  url?: string;
  tags: string[];
  networkId: string;
  beaconIdParams: {
    uuid: string;
    major: number;
    minor: number;
  };
  firmware: string;
  floorPlanId: string;
};

export type MerakiSSID = {
  number: number;
  name: string;
  enabled: boolean;
  splashPage: string;
  ssidAdminAccessible: boolean;
  authMode: string;
  psk?: string;
  dot11w?: {
    enabled: boolean;
    required: boolean;
  };
  dot11r?: {
    enabled: boolean;
    adaptive: boolean;
  };
  encryptionMode: string;
  wpaEncryptionMode: string;
  radiusServers?: {
    host: string;
    port: number;
    openRoamingCertificateId: number;
    caCertificate: string;
  }[];
  radiusAccountingEnabled?: boolean;
  radiusEnabled?: boolean;
  radiusAttributeForGroupPolicies?: string;
  radiusFailoverPolicy?: string;
  radiusLoadBalancingPolicy?: string;
  ipAssignmentMode: string;
  useVlanTagging?: boolean;
  defaultVlanId?: number;
  adminSplashUrl?: string;
  splashTimeout?: string;
  walledGardenEnabled?: boolean;
  walledGardenRanges?: string[];
  minBitrate: number;
  bandSelection: string;
  perClientBandwidthLimitUp: number;
  perClientBandwidthLimitDown: number;
  visible: boolean;
  availableOnAllAps: boolean;
  availabilityTags: string[];
  perSsidBandwidthLimitUp: number;
  perSsidBandwidthLimitDown: number;
  mandatoryDhcpEnabled?: boolean;
  radiusAccountingServers?: {
    host: string;
    port: number;
    openRoamingCertificateId: number;
    caCertificate: string;
  }[];
  speedBurst?: {
    enabled: boolean;
  };
};
export type MerakiVlan = {
  id: string;
  networkId: string;
  name: string;
  applianceIp: string;
  subnet: string;
  groupPolicyId: string;
  fixedIpAssignments: {
    [key: string]: {
      ip: string;
      name: string;
    };
  };
  reservedIpRanges: {
    start: string;
    end: string;
    comment: string;
  }[];
  dnsNameservers: string;
  dhcpHandling: string;
  dhcpLeaseTime: string;
  dhcpBootOptionsEnabled: boolean;
  dhcpBootNextServer: string;
  dhcpBootFilename: string;
  dhcpOptions: {
    code: string;
    type: string;
    value: string;
  }[];
  interfaceId: string;
};
