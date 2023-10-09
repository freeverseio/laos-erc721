// Import necessary Hardhat and ethers.js components
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { expectRevert } from '@openzeppelin/test-helpers';
import { ERC721LAOS } from '../typechain-types/contracts/ERC721LAOS';

describe('ERC721LAOS', function () {
  let owner: { address: any; };
  let addr1: { address: any; };
  let erc721: ERC721LAOS;

  // Deploy the contract and prepare accounts
  before(async function () {
    [owner, addr1] = await ethers.getSigners();

    const ERC721LAOS = await ethers.getContractFactory('ERC721LAOS');
    erc721 = await ERC721LAOS.deploy(owner.address);
    await erc721.waitForDeployment();
  });

  it('Should have the correct name and symbol', async function () {
    const name = await erc721.name();
    const symbol = await erc721.symbol();

    expect(name).to.equal('ERC721LAOS');
    expect(symbol).to.equal('EC');
  });

  it('Should mint tokens to the owner', async function () {
    const tokenId = 1;

    await erc721.connect(owner).safeMint(addr1.address, tokenId);

    const ownerOfToken = await erc721.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(addr1.address);

    const tokenURI = await erc721.tokenURI(tokenId)
    expect(tokenURI).to.equal("evochain1/collectionId/1")
  });

  it('Should not allow minting by non-owner', async function () {
    const tokenId = 2;

    expectRevert(
      erc721.connect(addr1).safeMint(addr1.address, tokenId),
      'OwnableUnauthorizedAccount("' + addr1 + '")'
    );
    
  });


});
