# ERC721BridgelessMinting Template Contract

This repository contains a Solidity ERC721 template contract designed for bridgeless minting. The contract is deployable on any EVM-compatible network. When deployed the contract creates 2^97-1 assets for each possible address. 

The primary use case of this contract is to represent asset ownership for the LAOS project. To learn more about the LAOS project, please refer to the [Additional Resources](#additional-resources) section.

The contract is built on top of the [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) library.

## Getting Started

### Prerequisites

Before you start, make sure you have all the required dependencies. You can install them using the following command:

```bash
npm install
```

### Compiling the Contract

Compile the contracts with the following command:

```bash
npx hardhat compile
```

### Testing the Contract

You can test the contract by running the following command:

```bash
npx hardhat test
```

### Deploying the Contract

To deploy the contract, use the following command:

```bash
npx hardhat run --network <network-name> scripts/deploy.ts
```

You can target any network defined in your Hardhat configuration.

### Verifying Contract

To verify contract on [etherscan](https://etherscan.io/) or any other EVM scan (e.g [Polygonscan](https://polygonscan.com/)) you should run the following command

```bash
npx hardhat verify --network <network-name> <contract-address> <contract-deploy-arguments>
```

To be able to do that, you should have API_KEY of appropriate scanner in .env file.

## Additional resources

* **LAOS Whitepaper**:  For a comprehensive understanding of the LAOS project, you can review the [whitepaper](https://github.com/freeverseio/laos-whitepaper)

* **LAOS Roadmap**: To explore the future plans and updates for LAOS, visit the [roadmap](https://github.com/freeverseio/laos-roadmap)