import { ethers } from "hardhat";

async function main() {
  const collectionName = "Bridgeless Minting";
  const tokenSymbol = "LAETH";
  const baseURI = "https://uloc.io/GlobalConsensus(3)/Parachain(3336)/PalletInstance(51)/AccountKey20(0xfffffffffffffffffffffffe0000000000000044)/";

  const accounts = await ethers.getSigners();
  console.log("Deploying contracts with the account:", accounts[0].address);

  const ContractFactory = await ethers.getContractFactory(
    "ERC721Universal",
  );

  const instance = await ContractFactory.deploy(
    accounts[0].address,
    collectionName,
    tokenSymbol,
    baseURI,
  );
  await instance.waitForDeployment();

  console.log(`Contract deployed to ${await instance.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
