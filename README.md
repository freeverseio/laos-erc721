# ERC721Universal Template Contract

This repository contains a Solidity ERC721 template contract designed for universal bridgeless minting. The contract is deployable on any EVM-compatible network. On deploy, the contract allocates slots (indexed by a 96b integer) to each possible 160b address. These slots can be filled, equivalent to minting and evolving, on the LAOS evolution chain.

To learn more about this pattern, and the overall LAOS architecture,
please refer to the [Additional Resources](#additional-resources) section.

The contract is built on top of the [OpenZeppelin ERC721 Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) library.

## Getting Started

### Prerequisites

Make sure you have all the required dependencies:

```bash
npm ci
```

### Compiling the Contract

Compile the contracts with the following command:

```bash
npx hardhat compile
```

### Testing the Contract

The following command runs the test suite:

```bash
npx hardhat test
```

### Deploying the Contract

To deploy the contract, edit the `hardhat.config.ts` file, and use the following command:

```bash
npx hardhat run --network <network-name> scripts/deploy.ts
```

### Verifying Contract

The following command can be used to verify the deployed contracts on [etherscan](https://etherscan.io/) or any other EVM scan (e.g [Polygonscan](https://polygonscan.com/)):

```bash
npx hardhat verify --network <network-name> <contract-address> <contract-deploy-arguments>
```

Make sure to obtain the corresponding API_KEY, and set it in the `.hardhat.config.ts` file.

## Additional resources

- **LAOS Whitepaper**: For a comprehensive understanding of the LAOS project, please review the [whitepaper](https://github.com/freeverseio/laos-whitepaper)

- **LAOS Roadmap**: To explore the future plans and updates for LAOS, visit the [roadmap](https://github.com/freeverseio/laos-roadmap)
