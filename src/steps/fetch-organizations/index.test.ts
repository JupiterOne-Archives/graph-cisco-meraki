import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupMerakiRecording } from '../../../test';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

describe('organizationSteps', () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchOrganizations', () => {
    test('should create organization entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchOrganizations',
      });

      const stepConfig = buildStepTestConfigForStep(
        StepIds.FETCH_ORGANIZATIONS,
      );
      const stepResults = await executeStepWithDependencies(stepConfig);

      expect(stepResults).toMatchStepMetadata(stepConfig);
    });
  });
});
