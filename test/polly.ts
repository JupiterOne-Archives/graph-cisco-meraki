import { Har } from 'har-format';

import { Polly } from '@pollyjs/core';
import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import FSPersister from '@pollyjs/persister-fs';

Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

export { Polly } from '@pollyjs/core';

class TrendMicroFSPersister extends FSPersister {
  static get id(): string {
    return 'TrendMicroFSPersister';
  }

  saveRecording(recordingId: number, data: Har): void {
    data.log.entries.forEach((entry) => {
      // Redact tokens, even though they expire
      entry.request.headers.forEach((header) => {
        if (header.name === 'api-secret-key') {
          header.value = '[REDACTED]';
        }
      });

      // Redact all cookie values
      entry.response.headers = entry.response.headers.map((e) => {
        if (e.name === 'set-cookie') {
          return { ...e, value: '[REDACTED]' };
        } else {
          return e;
        }
      });

      entry.response.cookies = entry.response.cookies.map((e) => ({
        ...e,
        value: '[REDACTED]',
      }));
    });

    super.saveRecording(recordingId, data);
  }
}

export function setupPolly(recordingsDir: string, name: string): Polly {
  return new Polly(name, {
    adapters: ['node-http'],
    persister: TrendMicroFSPersister,
    persisterOptions: {
      TrendMicroFSPersister: {
        recordingsDir: `${recordingsDir}/__recordings__`,
      },
    },
    matchRequestsBy: {
      headers: false,
      body: false,
    },
  });
}
