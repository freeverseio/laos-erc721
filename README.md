# ERC721 LAOS template contract 

This repository houses a Solidity-based ERC721 template contract. It is designed for deploying ERC721 contracts on any EVM-compatible blockchain, intended for representing asset ownership within the LAOS project. The project is based on [open-zeppeling contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) 

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
