# ERC721Universal Template Contract

This repository contains a Solidity ERC721 template contract designed for Universal asset minting and evolution. The contract is deployable on any EVM-compatible network. On deploy, the contract allocates slots (indexed by a 96b integer) to each possible 160b address. These slots can be filled, equivalent to minting and evolving, on the LAOS evolution chain.

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

## Gas cost considerations

The pattern implemented by this contract, in conjunction with the LAOS blockchain, 
allows the minting and evolution of an arbitrary number of NFTs on any EVM-compatible Layer 1. 
All minting gas fees are paid on the LAOS blockchain,
with a single exception: the initial cost of deploying the contract on the chosen Layer 1.

Assets appear on-chain in the selected Layer 1 and can be traded using that chain's native
currency within its existing ecosystem.

For DApps to accurately reflect bridgelessly minted assets,
they can opt to monitor both consensus systems or, more conveniently,
utilize a Universal Node as their RPC endpoint. Additional details are available in [these resources](https://docs.laosnetwork.io/introduction/resources).

Users desiring visibility for their bridgelessly minted assets in DApps not yet integrating the above methods have several options:

- Transferring the asset once ensures automatic tracking by all DApps. This can be done via importing the asset to a web3 wallet
(e.g. Metamask), and sending it, either via a 'self-transfer' (the same address acts as sender and receiver),
or to another controlled address.

- Utilizing the contract's broadcast features, which emit mint events (`broadcastMint`) or self-transfer events (`broadcastSelfTransfer`), 
not altering the contract's storage, and thus incurring minimal gas fees. The batch versions of these methods
significantly reduce gas costs by circumventing the base transaction fee of 21000 gas.

Here are approximate gas costs for comparison (check the [tests](./test/ERC721Universal.ts) for verification):

* Any number of mints in DApps using any of the above patterns: 0 gas
* Mint of 1 asset using the default [OpenZeppelin ERC721 Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts): 140,683 gas
* `broadcastMint` of 1 asset: 28,140 gas
* `broadcastSelfTransfer` of 1 asset: 28,207 gas
* `broadcastSelfTransferBatch` of 1000 assets: 7,016,723 = 7,016 per asset



## Additional resources

- **LAOS Documentation**: For developers wanting to start building on LAOS, [here](https://docs.laosnetwork.io/).
- **LAOS Whitepaper**: For a comprehensive understanding of the LAOS project, please review the [whitepaper](https://github.com/freeverseio/laos-whitepaper).
- **LAOS Roadmap**: To explore the future plans and updates for LAOS, visit the [roadmap](https://github.com/freeverseio/laos-roadmap).
