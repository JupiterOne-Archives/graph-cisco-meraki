import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../test/config';
import { setupMerakiRecording } from '../../../test/recording';
import { StepIds } from '../../constants';

// TODO @zemberdotnet Investigate why this step takes so long
jest.setTimeout(200000);
describe('deviceSteps', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchDevices', () => {
    // this test would pass if the `device` notes property was an array
    test.skip('should create device entities and relationships', async () => {
      // this step can take a while
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchDevices',
      });

      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_DEVICES);
      const stepResult = await executeStepWithDependencies(stepConfig);

      expect(stepResult).toMatchStepMetadata(stepConfig);
    });
  });
});
