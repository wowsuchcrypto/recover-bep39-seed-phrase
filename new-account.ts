// Just used for testing.
// Run: `yarn ts-node new-account.ts`

import {generateMnemonic, mnemonicToSeed} from 'bip39';
import {hdkey} from 'ethereumjs-wallet';

(async () => {
    const mnemonic = generateMnemonic();
    const hdwallet = hdkey.fromMasterSeed(await mnemonicToSeed(mnemonic));
    const walletHdpath = "m/44'/60'/0'/0/";
    const accounts = [];
    for (let i = 0; i < 10; i++) {
        const wallet = hdwallet.derivePath(walletHdpath + i).getWallet();
        const address = '0x' + wallet.getAddress().toString('hex');
        const privateKey = wallet.getPrivateKey().toString('hex');
        accounts.push({address: address, privateKey: privateKey});
    }

    console.log('Mnemonic:', mnemonic);
    console.log('Accounts:', accounts);
})();
