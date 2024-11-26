/* eslint-disable */
import { Contract } from 'cashscript';
import p2pkhArtifact from '../fixture/p2pkh.artifact';
import p2pkhArtifactJsonNotConst from '../fixture/p2pkh.json';
import announcementArtifact from '../fixture/announcement.artifact';
import hodlVaultArtifact from '../fixture/hodl_vault.artifact';
import { alicePkh, alicePub, oraclePub } from '../fixture/vars';
import { binToHex } from '@bitauth/libauth';

// describe('P2PKH contract | single constructor input')
{
  // it('should not give type errors when using correct constructor inputs')
  new Contract(p2pkhArtifact, [alicePkh]);
  new Contract(p2pkhArtifact, [binToHex(alicePkh)]);

  // it('should give type errors when using empty constructor inputs')
  // @ts-expect-error
  new Contract(p2pkhArtifact, []);

  // it('should give type errors when using incorrect constructor input type')
  // @ts-expect-error
  new Contract(p2pkhArtifact, [1000n]);

  // it('should give type errors when using incorrect constructor input length')
  // @ts-expect-error
  new Contract(p2pkhArtifact, [alicePkh, 1000n]);

  // it('should not perform type checking when cast to any')
  new Contract(p2pkhArtifact as any, [alicePkh, 1000n]);

  // it('should not perform type checking when cannot infer type')
  // Note: would be very nice if it *could* infer the type from static json
  new Contract(p2pkhArtifactJsonNotConst, [alicePkh, 1000n]);
}

// describe('Announcement contract | no constructor inputs')
{
  // it('should not give type errors when using correct constructor inputs')
  new Contract(announcementArtifact, []);

  // it('should give type errors when using incorrect constructor input length')
  // @ts-expect-error
  new Contract(announcementArtifact, [1000n]);

  // it('should give type errors when passing in completely incorrect type')
  // @ts-expect-error
  new Contract(announcementArtifact, 'hello');
}

// describe('HodlVault contract | 4 constructor inputs')
{
  // it('should not give type errors when using correct constructor inputs')
  new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub), 1000n, 1000n]);

  // it('should give type errors when using too few constructor inputs')
  // @ts-expect-error
  new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub)]);

  // it('should give type errors when using incorrect constructor input type')
  // @ts-expect-error
  new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub), 1000n, 'hello']);
  // @ts-expect-error
  new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub), true, 1000n]);
}
