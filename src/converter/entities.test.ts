import { MerakiNetwork } from '../collector';
import { getNetworkType } from './entities';

describe('#getNetworkType', () => {
  test('should return unknown for undefined or null', () => {
    expect(getNetworkType({} as MerakiNetwork)).toBe('unknown');
    expect(
      getNetworkType(({ productTypes: null } as unknown) as MerakiNetwork),
    ).toBe('unknown');
  });

  test('should be unknown for empty array', () => {
    expect(
      getNetworkType(({ productTypes: [] } as unknown) as MerakiNetwork),
    ).toBe('unknown');
  });

  test('should be 0th value for array with length 1', () => {
    expect(
      getNetworkType(({ productTypes: ['val'] } as unknown) as MerakiNetwork),
    ).toBe('val');
  });

  test('should be combined for arrays with length > 1', () => {
    expect(
      getNetworkType(({
        productTypes: ['val1', 'val2'],
      } as unknown) as MerakiNetwork),
    ).toBe('combined');
  });
});
