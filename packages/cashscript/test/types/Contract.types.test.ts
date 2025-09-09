/* eslint-disable */
import { Artifact, Contract, MockNetworkProvider, SignatureTemplate, Transaction, Unlocker } from 'cashscript';
import p2pkhArtifact from '../fixture/p2pkh.artifact';
import p2pkhArtifactJsonNotConst from '../fixture/p2pkh.json' with { type: 'json' };
import announcementArtifact from '../fixture/announcement.artifact';
import hodlVaultArtifact from '../fixture/hodl_vault.artifact';
import transferWithTimeoutArtifact from '../fixture/transfer_with_timeout.artifact';
import { alicePkh, alicePriv, alicePub, bobPub, oraclePub } from '../fixture/vars';
import { binToHex } from '@bitauth/libauth';

interface ManualArtifactType extends Artifact {
  constructorInputs: [
    {
      name: 'pkh',
      type: 'bytes20',
    },
  ],
  abi: [
    {
      name: 'spend',
      inputs: [
        {
          name: 'pk',
          type: 'pubkey',
        },
        {
          name: 's',
          type: 'sig',
        },
      ],
    },
  ]
}

// Create a MockNetworkProvider for the tests
const provider = new MockNetworkProvider();

// describe('P2PKH contract | single constructor input | single function (2 args)')
{
  // describe('Constructor arguments')
  {
    // it('should not give type errors when using correct constructor inputs')
    new Contract(p2pkhArtifact, [alicePkh], { provider });
    new Contract(p2pkhArtifact, [binToHex(alicePkh)], { provider });

    // it('should give type errors when using empty constructor inputs')
    // @ts-expect-error
    new Contract(p2pkhArtifact, [], { provider });

    // it('should give type errors when using incorrect constructor input type')
    // @ts-expect-error
    new Contract(p2pkhArtifact, [1000n], { provider });

    // it('should give type errors when using incorrect constructor input length')
    // @ts-expect-error
    new Contract(p2pkhArtifact, [alicePkh, 1000n], { provider });

    // it('should not perform type checking when cast to any')
    new Contract(p2pkhArtifact as any, [alicePkh, 1000n], { provider });

    // it('should not perform type checking when cannot infer type')
    // Note: would be very nice if it *could* infer the type from static json
    new Contract(p2pkhArtifactJsonNotConst, [alicePkh, 1000n], { provider });

    // it('should perform type checking when manually specifying a type
    // @ts-expect-error
    new Contract<ManualArtifactType>(p2pkhArtifactJsonNotConst as any, [alicePkh, 1000n], { provider });

    // it('requires a provider to be passed')
    // @ts-expect-error
    new Contract(p2pkhArtifact, [alicePkh]);
  }

  // describe('Contract unlockers')
  {
    const contract = new Contract(p2pkhArtifact, [alicePkh], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.unlock.spend(alicePub, new SignatureTemplate(alicePriv));

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.unlock.notAFunction();

    // it('should give type errors when using incorrect function input types')
    // @ts-expect-error
    contract.unlock.spend(1000n, true);

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.unlock.spend(alicePub, new SignatureTemplate(alicePriv), 100n);
    // @ts-expect-error
    contract.unlock.spend(alicePub);

    // it('should not perform type checking when cast to any')
    const contractAsAny = new Contract(p2pkhArtifact as any, [alicePkh, 1000n], { provider });
    contractAsAny.unlock.notAFunction();
    contractAsAny.unlock.spend();
    contractAsAny.unlock.spend(1000n, true);

    // it('should not perform type checking when cannot infer type')
    // Note: would be very nice if it *could* infer the type from static json
    const contractFromUnknown = new Contract(p2pkhArtifactJsonNotConst, [alicePkh, 1000n], { provider });
    contractFromUnknown.unlock.notAFunction();
    contractFromUnknown.unlock.spend();
    contractFromUnknown.unlock.spend(1000n, true);

    // it('should give type errors when calling methods that do not exist on the returned object')
    // @ts-expect-error
    contract.unlock.spend().notAFunction();
    // @ts-expect-error
    contractAsAny.unlock.spend().notAFunction();
    // @ts-expect-error
    contractFromUnknown.unlock.spend().notAFunction();
  }

  // describe('Contract functions')
  {
    const contract = new Contract(p2pkhArtifact, [alicePkh], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.functions.spend(alicePub, new SignatureTemplate(alicePriv)).build();

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.functions.notAFunction();

    // it('should give type errors when using incorrect function input types')
    // @ts-expect-error
    contract.functions.spend(1000n, true);

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.functions.spend(alicePub, new SignatureTemplate(alicePriv), 100n);
    // @ts-expect-error
    contract.functions.spend(alicePub);

    // it('should not perform type checking when cast to any')
    const contractAsAny = new Contract(p2pkhArtifact as any, [alicePkh, 1000n], { provider });
    contractAsAny.functions.notAFunction().build();
    contractAsAny.functions.spend();
    contractAsAny.functions.spend(1000n, true);

    // it('should not perform type checking when cannot infer type')
    // Note: would be very nice if it *could* infer the type from static json
    const contractFromUnknown = new Contract(p2pkhArtifactJsonNotConst, [alicePkh, 1000n], { provider });
    contractFromUnknown.functions.notAFunction().build();
    contractFromUnknown.functions.spend();
    contractFromUnknown.functions.spend(1000n, true);

    // it('should give type errors when calling methods that do not exist on the returned object')
    // @ts-expect-error
    contract.functions.spend().notAFunction();
    // @ts-expect-error
    contractAsAny.functions.spend().notAFunction();
    // @ts-expect-error
    contractFromUnknown.functions.spend().notAFunction();
  }

  // describe('Contract unlockers')
  {
    const contract = new Contract(p2pkhArtifact, [alicePkh], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.unlock.spend(alicePub, new SignatureTemplate(alicePriv)).generateLockingBytecode();

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.unlock.notAFunction();

    // it('should give type errors when using incorrect function input types')
    // @ts-expect-error
    contract.unlock.spend(1000n, true);

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.unlock.spend(alicePub, new SignatureTemplate(alicePriv), 100n);
    // @ts-expect-error
    contract.unlock.spend(alicePub);

    // it('should not perform type checking when cast to any')
    const contractAsAny = new Contract(p2pkhArtifact as any, [alicePkh, 1000n], { provider });
    contractAsAny.unlock.notAFunction().generateLockingBytecode();
    contractAsAny.unlock.spend();
    contractAsAny.unlock.spend(1000n, true);

    // it('should not perform type checking when cannot infer type')
    // Note: would be very nice if it *could* infer the type from static json
    const contractFromUnknown = new Contract(p2pkhArtifactJsonNotConst, [alicePkh, 1000n], { provider });
    contractFromUnknown.unlock.notAFunction().generateLockingBytecode();
    contractFromUnknown.unlock.spend();
    contractFromUnknown.unlock.spend(1000n, true);

    // it('should give type errors when calling methods that do not exist on the returned object')
    // @ts-expect-error
    contract.unlock.spend().notAFunction();
    // @ts-expect-error
    contractAsAny.unlock.spend().notAFunction();
    // @ts-expect-error
    contractFromUnknown.unlock.spend().notAFunction();
  }
}

// describe('Announcement contract | no constructor inputs | single function (no args)')
{
  // describe('Constructor arguments')
  {
    // it('should not give type errors when using correct constructor inputs')
    new Contract(announcementArtifact, [], { provider });

    // it('should give type errors when using incorrect constructor input length')
    // @ts-expect-error
    new Contract(announcementArtifact, [1000n], { provider });

    // it('should give type errors when passing in completely incorrect type')
    // @ts-expect-error
    new Contract(announcementArtifact, 'hello', { provider });
  }

  // describe('Contract unlockers')
  {
    // it('should not give type errors when using correct function inputs')
    const contract = new Contract(announcementArtifact, [], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.unlock.announce();

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.unlock.notAFunction();

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.unlock.announce('hello world');
  }

  // describe('Contract functions')
  {
    // it('should not give type errors when using correct function inputs')
    const contract = new Contract(announcementArtifact, [], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.functions.announce();

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.functions.notAFunction();

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.functions.announce('hello world');
  }
}

// describe('HodlVault contract | 4 constructor inputs | single function (3 args)')
{
  // describe('Constructor arguments')
  {
    // it('should not give type errors when using correct constructor inputs')
    new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub), 1000n, 1000n], { provider });

    // it('should give type errors when using too few constructor inputs')
    // @ts-expect-error
    new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub)], { provider });

    // it('should give type errors when using incorrect constructor input type')
    // @ts-expect-error
    new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub), 1000n, 'hello'], { provider });
    // @ts-expect-error
    new Contract(hodlVaultArtifact, [alicePub, binToHex(oraclePub), true, 1000n], { provider });
  }
}


// describe('TransferWithTimeout contract | 3 constructor inputs | two functions (1 arg each)')
{
  // describe('Constructor arguments')
  {
    // it('should not give type errors when using correct constructor inputs')
    new Contract(transferWithTimeoutArtifact, [alicePub, bobPub, 100_000n], { provider });
  }

  // describe('Contract unlockers')
  {
    const contract = new Contract(transferWithTimeoutArtifact, [alicePub, bobPub, 100_000n], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.unlock.transfer(new SignatureTemplate(alicePriv));
    contract.unlock.timeout(new SignatureTemplate(alicePriv));

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.unlock.notAFunction();

    // it('should give type errors when using incorrect function input types')
    // @ts-expect-error
    contract.unlock.transfer(1000n);
    // @ts-expect-error
    contract.unlock.timeout(true);

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.unlock.transfer(new SignatureTemplate(alicePub), 100n);
    // @ts-expect-error
    contract.unlock.timeout();
  }

  // describe('Contract functions')
  {
    const contract = new Contract(transferWithTimeoutArtifact, [alicePub, bobPub, 100_000n], { provider });

    // it('should not give type errors when using correct function inputs')
    contract.functions.transfer(new SignatureTemplate(alicePriv));
    contract.functions.timeout(new SignatureTemplate(alicePriv));

    // it('should give type errors when calling a function that does not exist')
    // @ts-expect-error
    contract.functions.notAFunction();

    // it('should give type errors when using incorrect function input types')
    // @ts-expect-error
    contract.functions.transfer(1000n);
    // @ts-expect-error
    contract.functions.timeout(true);

    // it('should give type errors when using incorrect function input length')
    // @ts-expect-error
    contract.functions.transfer(new SignatureTemplate(alicePub), 100n);
    // @ts-expect-error
    contract.functions.timeout();
  }
}
