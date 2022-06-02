import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupMerakiRecording } from '../../../test';
import { buildStepTestConfigForStep } from '../../../test/config';
import { StepIds } from '../../constants';

// TODO: @zemberdotnet remove timeout when we have identified why steps are
// hanging/ taking a long time
jest.setTimeout(100000);

describe('vlansStep', () => {
  let recording: Recording;
  afterEach(async () => {
    await recording.stop();
  });

  describe('#fetchVlans', () => {
    // test passes but need to understand data better before making a recording
    test.skip('should create entities and relationships', async () => {
      recording = setupMerakiRecording({
        directory: __dirname,
        name: 'fetchVlans',
      });

      const stepConfig = buildStepTestConfigForStep(StepIds.FETCH_VLANS);
      const stepResult = await executeStepWithDependencies(stepConfig);

      expect(stepResult).toMatchStepMetadata(stepConfig);
    });
  });
});
