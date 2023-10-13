// Import necessary Hardhat and ethers.js components
import { expect } from 'chai';
import { ethers } from 'hardhat';

import { Enum } from '../utils/enums.ts';

import { ERC721BridgelessMinting } from '../typechain-types/contracts/ERC721BridgelessMinting.js';
import { ERC721ReceiverMock } from '../typechain-types/contracts/tests/ERC721ReceiverMock.js';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

// TODO: burn
// TODO: exists
// owner of 0
// add linting

describe('ERC721LAOS', function () {

  const maxBalance = 2n ** 96n;

  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addr3: HardhatEthersSigner;
  let defaultOperator: HardhatEthersSigner;

  let erc721: ERC721BridgelessMinting;
  let erc721Receiver: ERC721ReceiverMock;

  const RECEIVER_MAGIC_VALUE = '0x150b7a02';
  const RevertType = Enum('None', 'RevertWithoutMessage', 'RevertWithMessage', 'RevertWithCustomError', 'Panic');

  // Deploy the contract and prepare accounts
  beforeEach(async function () {
    [owner, addr1, addr2, addr3, defaultOperator] = await ethers.getSigners();

    const ERC721BridgelessMintingFactory = await ethers.getContractFactory('ERC721BridgelessMinting');
    erc721 = await ERC721BridgelessMintingFactory.deploy(
      'laos-kitties',
      'LAK',
      'evochain1/collectionId/'
    );
    await erc721.waitForDeployment();
  });

  it('Should have the correct name and symbol', async function () {
    const name = await erc721.name();
    const symbol = await erc721.symbol();

    expect(name).to.equal('laos-kitties');
    expect(symbol).to.equal('LAK');
  });

  it('Should return correct tokenURI', async function () {
    const tokenId = 1;
    const tokenURI = await erc721.tokenURI(tokenId);
    expect(await erc721.tokenURI(tokenId)).to.equal('evochain1/collectionId/1');
  });

  it('Should return the initial owner of the token if it is not transferred yet', async function () {
    const tokenId = 2;
    const ownerOfToken = await erc721.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(ethers.toBeHex(tokenId, 20));
  });

  it('The null address is the only one that cannot own tokens', async function () {
    const slot = '34';
    const nullAddress = ethers.toBeHex(0, 20);
    const tokenId = ethers.toBeHex('0x' + slot + nullAddress.substring(2), 32);
    await expect(erc721.ownerOf(tokenId))
    .to.be.revertedWithCustomError(erc721, 'ERC721NonexistentToken')
    .withArgs(tokenId);
  });

  it('initOwner decodes as expected', async function () {
    let slot = '111';
    let tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr1.address);

    slot = '';
    tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr1.address);

    slot = '';
    tokenId = ethers.toBeHex('0x' + slot + addr2.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr2.address);

    slot = '';
    const nullAddress = ethers.toBeHex(0, 20);
    tokenId = ethers.toBeHex('0x' + slot + nullAddress.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(nullAddress);

    const largestSlot = ethers.toBeHex(2n ** 96n - 1n, 12);
    tokenId = ethers.toBeHex('0x' + largestSlot.substring(2) + addr2.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr2.address);
  });

  it('Owner of the asset should be able to transfer his asset', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);
    expect(await erc721.balanceOf(addr2.address)).to.equal(maxBalance);

    await expect(erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId))
      .to.emit(erc721, 'Transfer')
      .withArgs(addr1.address, addr2.address, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr2.address);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);
    expect(await erc721.balanceOf(addr2.address)).to.equal(maxBalance);

    await expect(erc721.connect(addr2).transferFrom(addr2.address, addr3.address, tokenId))
      .to.emit(erc721, 'Transfer')
      .withArgs(addr2.address, addr3.address, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr3.address);

    expect(await erc721.balanceOf(addr2.address)).to.equal(maxBalance);
    expect(await erc721.balanceOf(addr3.address)).to.equal(maxBalance);
  });

  it('Owner of the asset cannot transfer to null address', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const nullAddress = ethers.toBeHex(0, 20);
    await expect(erc721.connect(addr2).transferFrom(addr2.address, nullAddress, tokenId))
    .to.be.revertedWithCustomError(erc721, 'ERC721InvalidReceiver')
    .withArgs(nullAddress);
  });

  it('User should not be able to transfer an asset that he does not own', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    await expect(erc721.connect(addr2).transferFrom(addr2.address, addr1.address, tokenId))
      .to.be.revertedWithCustomError(erc721, 'ERC721InsufficientApproval')
      .withArgs(addr2.address, tokenId);
  });


  it('Owner of the asset should be able to do safe transfer of his asset', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMock = await ethers.getContractFactory('ERC721ReceiverMock');
    erc721Receiver = await ERC721ReceiverMock.deploy(RECEIVER_MAGIC_VALUE, RevertType.None);
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(erc721.connect(addr1).safeTransferFrom(addr1.address, receiverContractAddress, tokenId))
      .to.emit(erc721, 'Transfer')
      .withArgs(addr1.address, receiverContractAddress, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(receiverContractAddress);
  });

  it('Owner of the asset should be able to do safe transfer of his asset with data', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMock = await ethers.getContractFactory('ERC721ReceiverMock');
    erc721Receiver = await ERC721ReceiverMock.deploy(RECEIVER_MAGIC_VALUE, RevertType.None);
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721
        .connect(addr1)
        .safeTransferFrom(addr1.address, receiverContractAddress, tokenId, '0x43', { gasLimit: 300000 })
    )
      .to.emit(erc721, 'Transfer')
      .withArgs(addr1.address, receiverContractAddress, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(receiverContractAddress);
    });

  it('When Owner of the asset does safe transfer the receiver contract reverts on call', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMockFactory = await ethers.getContractFactory('ERC721ReceiverMock');
    erc721Receiver = await ERC721ReceiverMockFactory.deploy(RECEIVER_MAGIC_VALUE, RevertType.RevertWithMessage);
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721.connect(addr1).safeTransferFrom(addr1.address, receiverContractAddress, tokenId)
    ).to.be.revertedWith('ERC721ReceiverMock: reverting');
  });

  it('When Owner of the asset does safe transfer with data the receiver contract reverts on call', async function () {
    const slot = '111';
    const tokenId = ethers.toBeHex('0x' + slot + addr1.address.substring(2), 32);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMockFactory = await ethers.getContractFactory('ERC721ReceiverMock');
    erc721Receiver = await ERC721ReceiverMockFactory.deploy(RECEIVER_MAGIC_VALUE, RevertType.RevertWithMessage);
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721
        .connect(addr1)
        .safeTransferFrom(addr1.address, receiverContractAddress, tokenId, '0x43', { gasLimit: 300000 })
    ).to.be.revertedWith('ERC721ReceiverMock: reverting');
  });
});
