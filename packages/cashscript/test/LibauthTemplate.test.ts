import { Contract, MockNetworkProvider, Network, SignatureTemplate, Utxo, randomUtxo } from '../src/index.js';
import artifact from './fixture/transfer_with_timeout.json' assert { type: "json" };
import { alicePriv, alicePub, bobPriv, bobPub } from './fixture/vars.js';
import { buildTemplate, debugTemplate, evaluateTemplate, stringify } from '../src/LibauthTemplate.js';
import { compileString } from 'cashc';
import { binToHex } from '@bitauth/libauth';

describe(`Libauth template generation tests`, () => {
  test("Test transfer with timeout template", async () => {
    // {
    //   const code = `
    //   pragma cashscript ^0.9.0;
      
    //   contract TransferWithTimeout(
    //       pubkey sender,
    //       pubkey recipient,
    //       int timeout
    //   ) {
    //       // Require recipient's signature to match
    //       function transfer(sig recipientSig) {
    //         console.log(recipientSig, timeout, recipient, sender, 1, "A");
    //           require(checkSig(recipientSig, recipient));
    //       }

    //       // Require timeout time to be reached and sender's signature to match
    //       function timeout(sig senderSig) {

    //           require(checkSig(senderSig, sender));
    //           require(tx.time >= timeout);
    //       }
    //   }
    //   `;
    //       const artifact = compileString(code);

    //   const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    //   const contract = new Contract(artifact, [alicePub, bobPub, 100000n], { provider });
    //   console.log(binToHex(alicePub), binToHex(bobPub));

    //   const transaction = contract.functions.transfer(new SignatureTemplate(bobPriv)).to(contract.address, 10000n);
    //   const template = await buildTemplate({
    //     contract,
    //     transaction,
    //     manglePrivateKeys: false
    //   });

    //   console.log(stringify(template));
    //   debugTemplate(template, artifact);


    //   // expect(evaluateTemplate(template)).toBe(true);
    // }

    {
      const code = `
      pragma cashscript ^0.9.0;

      contract TransferWithTimeout(
          pubkey sender,
          pubkey recipient,
          int timeout
      ) {
          // Require recipient's signature to match
          function transfer(sig recipientSig) {
              require(checkSig(recipientSig, recipient));
          }

          // Require timeout time to be reached and sender's signature to match
          function timeout(sig senderSig) {
              // require(checkSig(senderSig, sender), "lol");
              // require(checkSig(senderSig, sender));
              require(senderSig == senderSig);
              require(sender == sender);
              require(tx.time >= timeout);
          }
      }
      `;
      const artifact = compileString(code);

      // const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const provider = new MockNetworkProvider();
      const contract = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });
      provider.addUtxo(contract.address, randomUtxo());

      const transaction = contract.functions.timeout(new SignatureTemplate(alicePriv)).to(contract.address, 1000n);
      const template = await buildTemplate({
        contract,
        transaction,
        manglePrivateKeys: false
      });

      // debugTemplate(template, artifact);
      await transaction.send();

      // expect(debugTemplate(template)).toBe(false);
    }
  });
});