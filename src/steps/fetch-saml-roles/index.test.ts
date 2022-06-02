import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupMerakiRecording } from '../../../test';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

describe('samlRolesSteps', () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchSamlRoles', () => {
    test('should create entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchSamlRoles',
      });
      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_SAML_ROLES);
      const stepResults = await executeStepWithDependencies(stepConfig);

      expect(stepResults).toMatchStepMetadata(stepConfig);
    });
  });
});
