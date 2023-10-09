# ERC721 LAOS template contract 

This repository contains solidity template ERC721 contract. It can be used for deploying erc721 contracts on any evm 
blockchain to be used as ownership in LAOS project. The project is based on [open-zeppeling contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) 

## Installing dependencies

```
npm install
```

## Compiling the contract

```
npx hardhat compile
```

## Testing the contract

```
npx hardhat test
```

## Deploying the contract

You can target any network from your Hardhat config using:

```
npx hardhat run --network <network-name> scripts/deploy.ts
```
