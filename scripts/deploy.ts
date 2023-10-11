import { ethers } from 'hardhat';

async function main() {
  const tokenName = 'laos-kitties';
  const tokenSymbol = 'LAK';
  const baseURI = 'evochain1/collectionId/';

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
    );

  const ContractFactory = await ethers.getContractFactory('ERC721BridgelessMinting');

  // TODO: Set addresses for the contract arguments below
  const instance = await ContractFactory.deploy(deployer.address, tokenName, tokenSymbol, baseURI);
  await instance.connect(deployer).waitForDeployment();

  console.log(`Contract deployed to ${await instance.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
