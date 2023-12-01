import { ethers } from "hardhat";

async function main() {
  const tokenName = "laos-kitties";
  const tokenSymbol = "LAK";
  const baseURI = "evochain1/collectionId/";

  const accounts = await ethers.getSigners();
  console.log("Deploying contracts with the account:", accounts[0].address);

  const ContractFactory = await ethers.getContractFactory(
    "ERC721Universal",
  );

  const instance = await ContractFactory.deploy(
    accounts[0].address,
    tokenName,
    tokenSymbol,
    baseURI,
  );
  await instance.waitForDeployment();

  const contractAddress = await instance.getAddress(); //"0x618B30809ccB6597aBfE0822dC36096837288F5";
  const tokenId = "1526678896913600633777236021071795506115833578868";
  
  console.log("Broadcasting in contract:", contractAddress);
  console.log("...from the account:", accounts[0].address);
  console.log("...tokenId:", tokenId);

  await instance.broadcastSelfTransfer(tokenId);
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
