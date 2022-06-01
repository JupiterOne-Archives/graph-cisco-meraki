import { adminSteps } from './fetch-admins';
import { clientSteps } from './fetch-clients';
import { deviceSteps } from './fetch-devices';
import { networkSteps } from './fetch-networks';
import { organizationSteps } from './fetch-organizations';
import { samlRoleSteps } from './fetch-saml-roles';
import { vlansSteps } from './fetch-vlans';
import { wifiSteps } from './fetch-wifi';

export const integrationSteps = [
  ...organizationSteps,
  ...networkSteps,
  ...deviceSteps,
  ...adminSteps,
  ...samlRoleSteps,
  ...vlansSteps,
  ...wifiSteps,
  ...clientSteps,
];
