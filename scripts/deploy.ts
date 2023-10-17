import { ethers } from "hardhat";

async function main() {
  const tokenName = "laos-kitties";
  const tokenSymbol = "LAK";
  const baseURI = "evochain1/collectionId/";

  console.log("Deploying contracts with the account:");

  const ContractFactory = await ethers.getContractFactory(
    "ERC721BridgelessMinting",
  );

  const instance = await ContractFactory.deploy(
    tokenName,
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
