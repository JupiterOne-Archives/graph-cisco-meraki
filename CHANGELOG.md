# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 3.2.0 - 2022-08-31

### Changed

- Explicitly assign `_key` value in Network/Vlan -HAS-> Client mapped
  relationships.
- Update `parseTimePropertyValue` to match new function signature

## 3.1.1 - 2022-08-29

### Fixed

- fixed duplicate `_key` values in `fetch-clients` step.

## 3.1.0 - 2022-07-15

### Changed

- Integration now supports pagination for networks and clients.
- Fixed a bug where a mapped relationships would be made from a VLAN entity that
  did not exists in the graph
- Fixed possible `undefined` device names

## 3.0.0 - 2022-05-14

### Changed

- `fetch-resources` step now broken into several smaller steps
- removed most use of `convertProperties`
- upgraded to API `v1`

## 2.2.2 - 2022-03-24

### Added

- `getVlans` method will now check if VLANs are enabled for the network before
  trying to get them. This fixes an error where if VLANs are not enabled for a
  network, calling `getNetwork_vlans` will result in an error like
  `{error: "VLANS are not enabled for this network"}`

## 2.2.1 - 2021-10-27

### Fixed

- The mapped relationship `Device-CONNECTS->Internet` now correctly targets the
  global Internet entity.

## 2.2.0 - 2021-10-13

### Changed

- Upgraded to `@jupiterone/integration-sdk-*@^7.0.0`

## 1.3.2 - 2020-06-01

### Changed

- Upgraded to `@jupiterone/integration-sdk@^3.1.0` to get TypeScript type fixes.

## 1.3.1 - 2020-06-01

### Fixed

- Define `IntegrationConfig` type and add as generic parameter as required.

## 1.3.0 - 2020-05-31

### Added

- Use mapped relationships to connect network entities to clients discovered on
  the network.
