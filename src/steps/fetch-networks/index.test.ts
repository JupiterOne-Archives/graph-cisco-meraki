import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../test/config';
import { setupMerakiRecording } from '../../../test/recording';
import { StepIds } from '../../constants';

describe('networkSteps', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  describe('fetchNetworks', () => {
    // This test would pass, but need to understand data before making recording
    test.skip('should create network entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchNetworks',
      });

      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_NETWORKS);
      const stepResult = await executeStepWithDependencies(stepConfig);

      expect(stepResult).toMatchStepMetadata(stepConfig);
    });
  });
});
