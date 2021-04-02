# JupiterOne Managed Integration for Cisco Meraki

## Overview

JupiterOne provides a managed integration for Cisco Meraki. The integration
connects directly to Cisco Meraki REST APIs to obtain configuration metadata and
analyze resource relationships.

## Cisco Meraki + JupiterOne Integration Benefits

- Visualize Cisco Meraki administrators, SAML roles, and devices within
  network sites in the JupiterOne graph.
- Map Cisco Meraki users to employees in your JupiterOne account.
- Map Cisco Meraki Wi-Fi, VLAN, and other network devices to your network sites.
- Monitor changes to Cisco Meraki administrators, SAML roles, and devices within
  your network sites using JupiterOne alerts.

## How it Works

- JupiterOne periodically fetches Cisco Meraki administrators, SAML roles, and devices to update the graph.
- Write JupiterOne queries to review and monitor updates to the graph.
- Configure alerts to take action when the JupiterOne graph changes.

## Requirements

- JupiterOne requires an API Key configured in your Cisco Meraki account. 
- You must have permission in JupiterOne to install new integrations.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance. Users configure the integration by providing API
credentials obtained through the Cisco Meraki Dashboard.

Meraki documentation provides detailed [instructions to enable API access][1].

## Entities

The following entity resources are ingested when the integration runs.

| Meraki Resources | \_type of the Entity  | \_class of the Entity |
| ---------------- | --------------------- | --------------------- |
| Organization     | `meraki_organization` | `Organization`        |
| Admin            | `meraki_admin`        | `User`                |
| SAML Role        | `meraki_saml_role`    | `AccessRole`          |
| Network          | `meraki_network`      | `Site`                |
| SSID             | `meraki_wifi`         | `Network`             |
| VLAN             | `meraki_vlan`         | `Network`             |
| Device           | `meraki_device`       | `Device`, `Host`      |

## Relationships

The following relationships are created/mapped:

| From                  | Edge    | To                 |
| --------------------- | ------- | ------------------ |
| `meraki_organization` | **HAS** | `meraki_admin`     |
| `meraki_organization` | **HAS** | `meraki_saml_role` |
| `meraki_organization` | **HAS** | `meraki_network`   |
| `meraki_network`      | **HAS** | `meraki_wifi`      |
| `meraki_network`      | **HAS** | `meraki_vlan`      |
| `meraki_network`      | **HAS** | `meraki_device`    |

[1]:
  https://documentation.meraki.com/zGeneral_Administration/Other_Topics/The_Cisco_Meraki_Dashboard_API
