import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupMerakiRecording } from '../../../test';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

describe('wifiSteps', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchWifi', () => {
    // skipped because no wireless networks in test account
    test.skip('should create entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchWifi',
      });

      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_WIFI);
      const stepResults = await executeStepWithDependencies(stepConfig);

      expect(stepResults).toMatchStepMetadata(stepConfig);
    });
  });
});
