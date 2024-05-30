import { ethers } from "hardhat";

async function main() {
  const collectionName = "Bridgeless Minting";
  const tokenSymbol = "LAETH";
  const baseURI = "https://uloc.io/GlobalConsensus(0:0x4756c4042a431ad2bbe61d8c4b966c1328e7a8daa0110e9bbd3d4013138a0bd4)/Parachain(2001)/PalletInstance(51)/AccountKey20(0xfffffffffffffffffffffffe000000000000035a)/";

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
