# Recover BEP39 seed

Given at least 10 words of a seed phrase (a.k.a. a "mnemonic"), this brute forces the remaining words.

Currently only supports English seed phrases. If you want to recover a seed that was generated in another language, let me know.

## Install

```bash
yarn
# or without yarn: npm install
```

## Usage

```bash
yarn crack 0xPublicAddressHere first seed words here
```

Example if you have the last 10 words:

```bash
yarn crack 0xd10e894c87d0bf69b889dc95e441076346e2ab0c rally lawn express rebel audit alpha canal sail spoon hamster
# Last 2 words will be: moon approve
# or without yarn: npm run crack 0xd10e894c87d0bf69b889dc95e441076346e2ab0c rally lawn express rebel audit alpha canal sail spoon hamster
```

Example if you have the last 11 words:

```bash
yarn crack 0xd10e894c87d0bf69b889dc95e441076346e2ab0c rally lawn express rebel audit alpha canal sail spoon hamster moon
# Last word will be: approve
```
