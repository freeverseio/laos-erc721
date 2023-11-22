import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x618B30809ccB6597aBfE0822dC36096837288F5";
  const tokenId = "1526678896913600633777236021071795506115833578868";
  
  const accounts = await ethers.getSigners();
  console.log("Broadcasting in contract:", contractAddress);
  console.log("...from the account:", accounts[0].address);

  const ContractFactory = await ethers.getContractFactory(
    "ERC721Universal",
  );

  const instance = await ContractFactory.attach(contractAddress);
  const tx = await instance.broadcastSelfTransfer(tokenId);

  console.log('Done');
  console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
