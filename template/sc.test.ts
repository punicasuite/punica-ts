import 'babel-polyfill';
import { initClient, invoke, loadWallet } from 'ontology-ts-test';

// tslint:disable:no-console
describe('Smart contract test', () => {
  const gasLimit = '20000';
  const gasPrice = '500';

  const wallet = loadWallet('${walletPath}');

  const contract = '${contract}';

  const client = initClient({ rpcAddress: 'http://polaris1.ont.io:20336' });

${tests}
});
