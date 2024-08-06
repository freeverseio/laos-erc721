import { ethers } from "hardhat";

async function main() {
  const collectionName = "LAOS Bridgeless Minting on Ethereum";
  const tokenSymbol = "LAOSETH";
  const baseURI = "https://uloc.io/GlobalConsensus(0:0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f)/Parachain(4006)/PalletInstance(51)/AccountKey20(0xfffffffffffffffffffffffe000000000000000e)/";

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
