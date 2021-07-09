import Web3 from 'web3';
import fs from 'fs';
import {mnemonicToSeed} from 'bip39';
import {hdkey} from 'ethereumjs-wallet';

const TOTAL_WORDS = 12;
const MIN_STARTING_WORDS = 10;

/**
 * @return Always lowercase.
 */
async function mnemonicToPublicAddress(mnemonic: string) {
    const hdwallet = hdkey.fromMasterSeed(await mnemonicToSeed(mnemonic));
    const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
    return '0x' + wallet.getAddress().toString('hex').toLowerCase();
}

function* permutationsForLast1Word() {
    for (let i = 0; i < bep39Words.length; i++) {
        yield firstWordsJoined + ' ' + bep39Words[i];
    }
}

function* permutationsForLast2Words() {
    for (let i = 0; i < bep39Words.length; i++) {
        for (let ii = 0; ii < bep39Words.length; ii++) {
            yield firstWordsJoined + ' ' + bep39Words[i] + ' ' + bep39Words[ii];
        }
    }
}

if (!process.argv[2]) {
    console.error('No address given');
    process.exit(1);
}
let address;
try {
    address = Web3.utils.toChecksumAddress(process.argv[2]).toLowerCase();
} catch (e) {
    console.error('Address is invalid: ' + process.argv[2]);
    process.exit(1);
}

const firstWordsJoined = process.argv[3] || '';
if (!firstWordsJoined) {
    console.error('No first words given');
    process.exit(1);
}
const firstWords = firstWordsJoined.split(' ');

const wordsToCrack = TOTAL_WORDS - firstWords.length;
let iterator;
if (wordsToCrack === 1) {
    iterator = permutationsForLast1Word();
} else if (wordsToCrack === 2) {
    iterator = permutationsForLast2Words();
} else if (wordsToCrack <= 0) {
    console.error(`Given ${firstWords.length} words - that is >= the total needed for a seed`);
    process.exit(1);
} else {
    console.error(`Only ${firstWords.length} seed words given - need at least ${MIN_STARTING_WORDS} to run in a realistic time`);
    process.exit(1);
}
console.log('Words to crack:', wordsToCrack);

// Ensure all given words are actually valid.
const bep39Words = fs.readFileSync('./bep39-words.txt', 'utf-8').trim().split('\n');
for (const firstWord of firstWords) {
    if (!bep39Words.includes(firstWord)) {
        console.error(`Given word "${firstWord}" but it is not a valid BEP39 word`);
        process.exit(1);
    }
}

const permutationsToCheck = bep39Words.length ** wordsToCrack;
console.log('Possible permutations:', permutationsToCheck);

(async () => {
    let checked = 0;
    for (const mnemonic of iterator) {
        const thisAddress = await mnemonicToPublicAddress(mnemonic);
        const correct = thisAddress === address;
        if (correct) {
            console.log(`Success! Full mnemonic for ${address} is: ${mnemonic}`);
            process.exit(0);
        } else if (Math.random() < 0.0001) {
            // Occasionally log our progress.
            const percent = ((checked / permutationsToCheck) * 100).toFixed(2);
            console.log(`Checked ${checked} permutations (${percent}%)... not ${mnemonic}`);
        }
        checked++;
    }

    console.error('Failed to find the correct mnemonic');
    process.exit(1);
})();
