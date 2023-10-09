import { ethers } from "hardhat";

async function main() {
  const ContractFactory = await ethers.getContractFactory("ERC721LAOS");

  // TODO: Set addresses for the contract arguments below
  let initialOwner
  const instance = await ContractFactory.deploy(initialOwner);
  await instance.waitForDeployment();

  console.log(`Contract deployed to ${await instance.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
