import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupMerakiRecording } from '../../../test';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

describe('adminSteps', () => {
  let recording: Recording;

  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchAdmins', () => {
    // TODO: add `active` property to admin user. The test would pass if it
    // had active
    test.skip('should create admin user entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchAdmins',
      });

      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_ADMINS);
      const stepResult = await executeStepWithDependencies(stepConfig);

      expect(stepResult).toMatchStepMetadata(stepConfig);
    });
  });
});
