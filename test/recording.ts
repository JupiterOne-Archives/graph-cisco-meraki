import {
  Recording,
  setupRecording as sdkSetupRecording,
} from '@jupiterone/integration-sdk/testing';
export { Recording } from '@jupiterone/integration-sdk/testing';

type SetupParameters = Parameters<typeof sdkSetupRecording>[0];

/**
 * This function is a wrapper around the SDK's setup recording function
 * that redacts the 'api-secret-key' header.
 */
export function setupRecording({
  name,
  directory,
  ...overrides
}: SetupParameters): Recording {
  return sdkSetupRecording({
    directory,
    name,
    redactedRequestHeaders: ['api-secret-key'],
    ...overrides,
  });
}
