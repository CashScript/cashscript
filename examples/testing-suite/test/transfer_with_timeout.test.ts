import artifact from '../artifacts/transfer_with_timeout.artifact.js';
import { Contract, MockNetworkProvider, SignatureTemplate, TransactionBuilder, randomUtxo } from 'cashscript';
import { alicePriv, alicePub, bobPub } from '../utils/keys.js';
import 'cashscript/vitest';

describe('test example contract functions', () => {
  const provider = new MockNetworkProvider();
  const contract = new Contract(artifact, [alicePub, bobPub, 100000n], { provider });

  // Create a contract Utxo
  const contractUtxo = randomUtxo();
  provider.addUtxo(contract.address, contractUtxo);

  it('should succeed when timeout is called after timeout block', async () => {
    // given
    const to = contract.address;
    const amount = 10000n;
    const blockHeight = await provider.getBlockHeight();

    // when
    const tx = new TransactionBuilder({ provider })
      .addInput(contractUtxo, contract.unlock.timeout(new SignatureTemplate(alicePriv)))
      .addOutput({ to, amount })
      .setLocktime(blockHeight);

    // then
    expect(tx).not.toFailRequire();
  });
});
