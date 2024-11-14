import { ethers, network } from "hardhat";

// To run this script:
// $ npx hardhat run scripts/deploy.ts --network <network_name>

async function main() {
  const accounts = await ethers.getSigners();

  // Set the 4 params used in the constructor: onwerOfCollection, collectionName, tokenSymbol, and baseURI.
  // For setting baseURI:
  // - select between LAOS Mainnet or LAOS Sigma Testnet
  // - Make sure the baseURI ends with a slash character "/"

  const ownerOfCollection = accounts[0].address;
  const collectionName = "Bridgeless Minting";
  const tokenSymbol = "LAETH";
  const siblingCollectionInLAOS = "0xfFFFFFffFFFFFFFFfFFffFFe0000000000000002";

  const useLAOSMainnet = true;
  const baseULOC =
    useLAOSMainnet ?
    "https://uloc.io/GlobalConsensus(2)/Parachain(3370)/PalletInstance(51)" :
    "GlobalConsensus(0:0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f)/Parachain(4006)/PalletInstance(51)";

  const baseURI = `${baseULOC}/AccountKey20(${siblingCollectionInLAOS})/`;
  
  console.log(`Deploying contract to ${network.name} with the account: ${accounts[0].address}`);

  const ContractFactory = await ethers.getContractFactory(
    "ERC721Universal",
  );

  const instance = await ContractFactory.deploy(
    ownerOfCollection,
    collectionName,
    tokenSymbol,
    baseURI,
  );
  await instance.waitForDeployment();

  const deployedContractAddress = await instance.getAddress();
  console.log(`Contract deployed to ${deployedContractAddress}`);
  console.log(`
    Verifying the code. If ${network.name} is supported by the hardhat plugin, 
    you can then verify the deployed code by adding the correspoing .env variable, and executing:
  `);
  console.log(`
    npx hardhat verify --network ${network.name} "${deployedContractAddress}" "${ownerOfCollection}" "${collectionName}" "${tokenSymbol}" "${baseURI}"
  `);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
