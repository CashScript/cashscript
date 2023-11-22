import { Contract, ElectrumNetworkProvider, Network, SignatureTemplate } from '../src/index.js';
import artifact from './fixture/transfer_with_timeout.json' assert { type: "json" };
import { alicePriv, alicePub, bobPriv, bobPub } from './fixture/vars.js';
import { buildTemplate, debugTemplate, evaluateTemplate, stringify } from '../src/LibauthTemplate.js';

describe(`Libauth template generation tests`, () => {
  test("Test transfer with timeout template", async () => {
    // {
    //   const provider = new ElectrumNetworkProvider(Network.CHIPNET);
    //   const contract = new Contract(artifact, [alicePub, bobPub, 100000n], { provider });

    //   const transaction = contract.functions.transfer(new SignatureTemplate(bobPriv)).to(contract.address, 10000n);
    //   const template = await buildTemplate({
    //     contract,
    //     transaction,
    //     manglePrivateKeys: false
    //   });

    //   // console.log(stringify(template));

    //   expect(evaluateTemplate(template)).toBe(true);
    // }

    {
      const provider = new ElectrumNetworkProvider(Network.CHIPNET);
      const contract = new Contract(artifact, [alicePub, bobPub, 2000000n], { provider });

      const transaction = contract.functions.timeout(new SignatureTemplate(alicePriv)).to(contract.address, 10000n);
      const template = await buildTemplate({
        contract,
        transaction,
        manglePrivateKeys: false
      });

      debugTemplate(template, artifact);

      // expect(debugTemplate(template)).toBe(false);
    }

    // const failingTemplate = (await contract.runFunctionFromStrings({
    //   action: "buildTemplate",
    //   function: "transfer",
    //   arguments: [alice.getPublicKeyCompressed(), charlie.toString()],
    //   to: {
    //     to: charlie.getDepositAddress(),
    //     amount: 7000n,
    //   },
    //   time: 215,
    //   utxoIds: contractUtxos.map(toUtxoId),
    // } as CashscriptTransactionI)) as AuthenticationTemplate;

    // expect(() => evaluateTemplate(failingTemplate)).toThrow();
  });
});