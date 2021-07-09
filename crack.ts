import fs from 'fs';
import {mnemonicToSeed} from 'bip39';
import {hdkey} from 'ethereumjs-wallet';

const TOTAL_WORDS = 12 as const;
const MIN_STARTING_WORDS = 10 as const;

async function mnemonicToWallet(mnemonic: string) {
    const hdwallet = hdkey.fromMasterSeed(await mnemonicToSeed(mnemonic));
    return hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
}

/**
 * @return Always lowercase.
 */
async function mnemonicToPublicAddress(mnemonic: string) {
    const wallet = await mnemonicToWallet(mnemonic);
    return '0x' + wallet.getAddress().toString('hex').toLowerCase();
}

async function mnemonicToPrivateKey(mnemonic: string) {
    const wallet = await mnemonicToWallet(mnemonic);
    return wallet.getPrivateKey().toString('hex');
}

function* permutationsForLast1Word() {
    for (const option of bep39Words) {
        yield `${firstWordsJoined} ${option}`;
    }
}

function* permutationsForLast2Words() {
    for (const option1 of bep39Words) {
        for (const option2 of bep39Words) {
            yield `${firstWordsJoined} ${option1} ${option2}`;
        }
    }
}

function fail(message: string) {
    console.error(message);
    process.exit(1);
}

if (!process.argv[2]) {
    fail('No address given');
}
const address = process.argv[2].toLowerCase();
if (!/^0x[a-f0-9]{40}$/.test(address)) {
    fail(`Address is invalid: ${process.argv[2]}`);
}

// First words may be given quoted or unquoted, so might be a single space-separated arg, or multiple args.
const firstWords = (process.argv.slice(3) ?? [])
    .join(' ')
    .split(/\s+/)
    .filter(w => w !== '');
if (firstWords.length === 0) {
    fail('No first words given');
}
const firstWordsJoined = firstWords.join(' ');

const wordsToCrack = TOTAL_WORDS - firstWords.length;
let iterator: Generator<string>;
if (wordsToCrack === 1) {
    iterator = permutationsForLast1Word();
} else if (wordsToCrack === 2) {
    iterator = permutationsForLast2Words();
} else if (wordsToCrack <= 0) {
    fail(`Given ${firstWords.length} words - that is >= the total needed for a seed (${TOTAL_WORDS})`);
} else {
    fail(`Only ${firstWords.length} seed words given - need at least ${MIN_STARTING_WORDS} to run in a realistic time`);
}
console.log(`Given ${firstWords.length} words, need to crack ${wordsToCrack}`);

// Ensure all given words are actually valid.
const bep39Words = fs.readFileSync('./bep39-words.txt', 'utf-8').trim().split('\n');
const bep39Length = bep39Words.length;
for (const firstWord of firstWords) {
    if (!bep39Words.includes(firstWord)) {
        fail(`Given word "${firstWord}" but it is not a valid BEP39 word`);
    }
}

const permutationsToCheck = bep39Length ** wordsToCrack;
console.log(`Possible permutations: ${permutationsToCheck}`);

(async () => {
    let checked = 0;
    for (const mnemonic of iterator!) {
        const thisAddress = await mnemonicToPublicAddress(mnemonic);
        const correct = thisAddress === address;
        if (correct) {
            console.log(`Success after ${checked} permutations!`);
            console.log(`Mnemonic for ${address} is: ${mnemonic}`);
            console.log(`Private key is: ${await mnemonicToPrivateKey(mnemonic)}`);
            process.exit(0);
        } else if (Math.random() < 0.0001) {
            // Occasionally log our progress.
            const percent = ((checked / permutationsToCheck) * 100).toFixed(2);
            const mnemonicShortened = mnemonic.replace(/^((?:\w+ ){3}).+((?: \w+){3})$/, '$1...$2');
            console.log(`Checked ${checked} permutations (${percent}%); last checked: ${mnemonicShortened}`);
        }
        checked++;
    }

    fail('Failed to find the correct mnemonic');
})();
