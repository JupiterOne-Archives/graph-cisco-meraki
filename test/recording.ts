import {
  Recording,
  setupRecording as sdkSetupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
export { Recording } from '@jupiterone/integration-sdk-testing';

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

export function setupMerakiRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    ...input,
    redactedRequestHeaders: ['X-Cisco-Meraki-Api-Key'],
    mutateEntry: (entry) => {
      redact(entry);
    },
  });
}

function redact(entry): void {
  const DEFAULT_REDACT = '[REDACTED]';
  const keysToRedactMap = new Map();

  keysToRedactMap.set('url', DEFAULT_REDACT);
  keysToRedactMap.set('samlConsumerUrl', DEFAULT_REDACT);
  keysToRedactMap.set('samlConsumerUrls', [DEFAULT_REDACT]);

  // true for the application/json header
  const isJson = (obj: any) =>
    obj.name === 'content-type' && obj.value.includes('application/json');

  const isJsonResponse = entry.response.headers.reduce(
    (flattenedValue, currentValue) => {
      return isJson(currentValue) || flattenedValue;
    },
    false,
  );
  // if we have a response that isn't json we can return early
  // don't try to parse
  if (!isJsonResponse) {
    return;
  }

  const response = JSON.parse(entry.response.content.text);

  if (response.forEach) {
    response.forEach((responseValue, responseIndex) => {
      keysToRedactMap.forEach((redactionValue, keysToRedact) => {
        if (responseValue[keysToRedact]) {
          response[responseIndex][keysToRedact] = redactionValue;
        }
      });
    });
    entry.response.content.text = JSON.stringify(response);
  }
}
