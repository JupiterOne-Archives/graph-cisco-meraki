import {
  mutations,
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
  mutations.unzipGzippedRecordingEntry(entry);
  const DEFAULT_REDACT = '[REDACTED]';
  const keysToRedactMap = new Map();

  keysToRedactMap.set('url', 'http://redactedurl.com');
  keysToRedactMap.set('samlConsumerUrl', DEFAULT_REDACT);
  keysToRedactMap.set('samlConsumerUrls', [DEFAULT_REDACT]);

  const isContentTypeHeader = (header: any) => header.name === 'content-type';
  const isApplicationJson = (header: any) =>
    header.value.includes('application/json');

  const isJsonResponse = entry.response.headers.reduce(
    (flattenedValue: Boolean, currentValue: Object) =>
      flattenedValue ||
      (isContentTypeHeader(currentValue) && isApplicationJson(currentValue)),
    false,
  );

  // if we have a response that is not 'application/json' return early so we
  // don't try to parse html
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
