import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupMerakiRecording } from '../../../test';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

describe('clientsSteps', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchClients', () => {
    // toMatchStepMetadata doesn't support mapped relationships
    test.skip('should create entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchClients',
      });

      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_CLIENTS);
      const stepResults = await executeStepWithDependencies(stepConfig);

      expect(stepResults).toMatchStepMetadata(stepConfig);
    });
  });
});
