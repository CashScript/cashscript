import * as p2pkh from '../../../examples/p2pkh';
import * as p2pkhArtifact from '../../../examples/p2pkh-artifact';
import * as meep from '../../../examples/meep';
import * as twt from '../../../examples/transfer_with_timeout';

describe('Examples', () => {
  it('P2PKH example works', async () => {
    await p2pkh.run();
  });

  it('P2PKH Artifact example works', async () => {
    await p2pkhArtifact.run();
  });

  it('Meep example works', async () => {
    await meep.run();
  });

  it('Transfer with Timeout example works', async () => {
    await twt.run();
  });
});
