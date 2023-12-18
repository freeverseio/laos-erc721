// Import necessary Hardhat and ethers.js components
import { expect } from "chai";
import { ethers } from "hardhat";

import { RevertType } from "../utils/enums.ts";

import { ERC721Universal } from "../typechain-types/contracts/ERC721Universal.js";
import { ERC721ReceiverMock } from "../typechain-types/contracts/tests/ERC721ReceiverMock.js";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ERC721Universal", function () {
  const maxBalance = 2n ** 96n;
  const defaultURI = "evochain1/collectionId/";

  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addr3: HardhatEthersSigner;

  let erc721: ERC721Universal;
  let erc721Receiver: ERC721ReceiverMock;

  const RECEIVER_MAGIC_VALUE = "0x150b7a02";

  // Deploy the contract and prepare accounts
  beforeEach(async function () {
    [addr1, addr2, addr3] = await ethers.getSigners();

    const ERC721UniversalFactory = await ethers.getContractFactory(
      "ERC721Universal",
    );
    erc721 = await ERC721UniversalFactory.deploy(
      addr1.address,
      "laos-kitties",
      "LAK",
      defaultURI,
    );
    await erc721.waitForDeployment();
  });

  it("Should report correct version of the uERC721 interface", async function () {
    expect(await erc721.ERC721UniversalVersion()).to.equal(1);
  });

  it("Should support the standard ERC721 interface", async function () {
    const InterfaceIdFactory = await ethers.getContractFactory(
      "InterfaceId",
    );
    const interfaceId = await InterfaceIdFactory.deploy();
    await interfaceId.waitForDeployment();

    // Tests both via direct contract calls, as well the on-chain OpenZeppelin lib checker:
    const specified721Id = "0x80ac58cd";
    expect(await interfaceId.getERC721Id()).to.equal(specified721Id);
    expect(await erc721.supportsInterface(specified721Id)).to.equal(true);
    expect(await interfaceId.supportsInterface(await erc721.getAddress(), specified721Id)).to.equal(true);
  });

  it("Should support standard ERC165 interface", async function () {
    const InterfaceIdFactory = await ethers.getContractFactory(
      "InterfaceId",
    );
    const interfaceId = await InterfaceIdFactory.deploy();
    await interfaceId.waitForDeployment();

    // Tests both via direct contract calls, as well the on-chain OpenZeppelin lib checker:
    const mustReplyTrue = "0x01ffc9a7";
    const mustReplyFalse = "0xffffffff";
    expect(await erc721.supportsInterface(mustReplyTrue)).to.equal(true);
    expect(await erc721.supportsInterface(mustReplyFalse)).to.equal(false);
    expect(await interfaceId.supportsERC165(await erc721.getAddress())).to.equal(true);
  });

  it("Should support ERC721Universal interface", async function () {
    const InterfaceIdFactory = await ethers.getContractFactory(
      "InterfaceId",
    );
    const interfaceId = await InterfaceIdFactory.deploy();
    await interfaceId.waitForDeployment();

    // Tests both via direct contract calls, as well the on-chain OpenZeppelin lib checker:
    const specified721UniversalId = "0x9832f941";
    expect(await interfaceId.getERC721UniversalId()).to.equal(specified721UniversalId);
    expect(await erc721.supportsInterface(specified721UniversalId)).to.equal(true);
    expect(await interfaceId.supportsInterface(await erc721.getAddress(), specified721UniversalId)).to.equal(true);
  });

  it("Can query BaseURI", async function () {
    expect(await erc721.baseURI()).to.equal(defaultURI);
  });

  it("Should emit OwnershipTransferred event on deploy", async function () {
    const deployedTx = erc721.deploymentTransaction();
    const nullAddress = ethers.toBeHex(0, 20);
    await expect(deployedTx)
      .to.emit(erc721, "OwnershipTransferred")
      .withArgs(nullAddress, addr1.address);

    // assert that the signature of the event (topic0) matches the expected value
    // first by computing it from the hash of the event type:
    const expectedTopic0 = "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0";
    const computedTopic0 = ethers.id("OwnershipTransferred(address,address)");
    expect(computedTopic0).to.equal(expectedTopic0);
    // second by retrieving it from the TX directly
    const receipt = await deployedTx?.wait();
    const eventIdx = 0;
    expect(receipt?.logs[eventIdx].topics[0]).to.equal(expectedTopic0);
  });


  it("Should emit NewERC721Universal event on deploy", async function () {
    const deployedTx = erc721.deploymentTransaction();
    const deployedAddress = await erc721.getAddress();
    await expect(deployedTx)
      .to.emit(erc721, "NewERC721Universal")
      .withArgs(deployedAddress, defaultURI);

    // assert that the signature of the event (topic0) matches the expected value
    // first by computing it from the hash of the event type:
    const expectedTopic0 = "0x74b81bc88402765a52dad72d3d893684f472a679558f3641500e0ee14924a10a";
    const computedTopic0 = ethers.id("NewERC721Universal(address,string)");
    expect(computedTopic0).to.equal(expectedTopic0);
    // second by retrieving it from the TX directly
    const receipt = await deployedTx?.wait();
    const eventIdx = 1;
    expect(receipt?.logs[eventIdx].topics[0]).to.equal(expectedTopic0);
  });

  it("Should have the correct name and symbol", async function () {
    const name = await erc721.name();
    const symbol = await erc721.symbol();

    expect(name).to.equal("laos-kitties");
    expect(symbol).to.equal("LAK");
  });

  it("Should return correct tokenURI", async function () {
    const tokenId = 1;
    expect(await erc721.tokenURI(tokenId)).to.equal(defaultURI + 'GeneralKey(' + tokenId + ')');

    const slot = "34";
    const largeTokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    const largeTokenIdAsUint256 = ethers.toBigInt(largeTokenId);
    expect(await erc721.tokenURI(largeTokenId)).to.equal(
      defaultURI + 'GeneralKey(' + largeTokenIdAsUint256.toString() + ')',
    );
  });

  it("Should return the initial owner of the token if it is not transferred yet", async function () {
    const tokenId = 2;
    const ownerOfToken = await erc721.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(ethers.toBeHex(tokenId, 20));
  });

  it("The null address is the only one that cannot own tokens", async function () {
    const slot = "34";
    const nullAddress = ethers.toBeHex(0, 20);
    const tokenId = ethers.toBeHex("0x" + slot + nullAddress.substring(2), 32);
    await expect(erc721.ownerOf(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);
  });

  it("initOwner decodes as expected", async function () {
    let slot = "111";
    let tokenId = ethers.toBeHex("0x" + slot + addr1.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr1.address);

    slot = "";
    tokenId = ethers.toBeHex("0x" + slot + addr1.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr1.address);

    slot = "";
    tokenId = ethers.toBeHex("0x" + slot + addr2.address.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(addr2.address);

    slot = "";
    const nullAddress = ethers.toBeHex(0, 20);
    tokenId = ethers.toBeHex("0x" + slot + nullAddress.substring(2), 32);
    expect(await erc721.initOwner(tokenId)).to.equal(nullAddress);

    const largestSlot = ethers.toBeHex(2n ** 96n - 1n, 12);
    tokenId = ethers.toBeHex(
      "0x" + largestSlot.substring(2) + addr2.address.substring(2),
      32,
    );
    expect(await erc721.initOwner(tokenId)).to.equal(addr2.address);
  });

  it("Owner of the asset should be able to transfer asset", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);
    expect(await erc721.balanceOf(addr2.address)).to.equal(maxBalance);

    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, addr2.address, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr2.address);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);
    expect(await erc721.balanceOf(addr2.address)).to.equal(maxBalance);

    await expect(
      erc721.connect(addr2).transferFrom(addr2.address, addr3.address, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr2.address, addr3.address, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(addr3.address);

    expect(await erc721.balanceOf(addr2.address)).to.equal(maxBalance);
    expect(await erc721.balanceOf(addr3.address)).to.equal(maxBalance);
  });

  it("Owner of the asset should be able to burn the asset", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);

    expect(await erc721.isBurned(tokenId)).to.equal(false);

    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

    expect(await erc721.isBurned(tokenId)).to.equal(true);

    await expect(erc721.ownerOf(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);
  });

  it("burn can be executed by approved operator", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);
    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);

    await expect(erc721.connect(addr1).setApprovalForAll(addr2.address, true))
      .to.emit(erc721, "ApprovalForAll")
      .withArgs(addr1.address, addr2.address, true);

    await expect(erc721.connect(addr2).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);
  });

  it("Asset cannot be burned by address that is not its owner", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    await expect(erc721.connect(addr2).burn(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721InsufficientApproval")
      .withArgs(addr2.address, tokenId);
  });

  it("Asset cannot be burned twice", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

    await expect(erc721.connect(addr1).burn(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);
  });

  it("Burned asset cannot be transferred", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);

    await expect(
      erc721.connect(addr1).transferFrom(nullAddress, addr2.address, tokenId),
    )
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);
  });

  it("Burned asset has no owner - query must fail", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);

    await expect(erc721.ownerOf(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);
  });

  it("Burned asset has no tokenURI - query must fail", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);

    await expect(erc721.tokenURI(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721NonexistentToken")
      .withArgs(tokenId);
  });

  it("Owner of the asset cannot transfer to null address via transfer method", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const nullAddress = ethers.toBeHex(0, 20);
    await expect(
      erc721.connect(addr2).transferFrom(addr2.address, nullAddress, tokenId),
    )
      .to.be.revertedWithCustomError(erc721, "ERC721InvalidReceiver")
      .withArgs(nullAddress);
  });

  it("User should not be able to transfer an asset that he does not own", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    await expect(
      erc721.connect(addr2).transferFrom(addr2.address, addr1.address, tokenId),
    )
      .to.be.revertedWithCustomError(erc721, "ERC721InsufficientApproval")
      .withArgs(addr2.address, tokenId);
  });

  it("Owner of the asset should be able to do safe transfer of asset", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMock =
      await ethers.getContractFactory("ERC721ReceiverMock");
    erc721Receiver = await ERC721ReceiverMock.deploy(
      RECEIVER_MAGIC_VALUE,
      RevertType.None,
    );
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721
        .connect(addr1)
        .safeTransferFrom(addr1.address, receiverContractAddress, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, receiverContractAddress, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(receiverContractAddress);
  });

  it("Owner of the asset should be able to do safe transfer of asset with data", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMock =
      await ethers.getContractFactory("ERC721ReceiverMock");
    erc721Receiver = await ERC721ReceiverMock.deploy(
      RECEIVER_MAGIC_VALUE,
      RevertType.None,
    );
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721
        .connect(addr1)
        .safeTransferFrom(
          addr1.address,
          receiverContractAddress,
          tokenId,
          "0x43",
          { gasLimit: 300000 },
        ),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, receiverContractAddress, tokenId);
    expect(await erc721.ownerOf(tokenId)).to.equal(receiverContractAddress);
  });

  it("When Owner of the asset does safe transfer the receiver contract reverts on call", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMockFactory =
      await ethers.getContractFactory("ERC721ReceiverMock");
    erc721Receiver = await ERC721ReceiverMockFactory.deploy(
      RECEIVER_MAGIC_VALUE,
      RevertType.RevertWithMessage,
    );
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721
        .connect(addr1)
        .safeTransferFrom(addr1.address, receiverContractAddress, tokenId),
    ).to.be.revertedWith("ERC721ReceiverMock: reverting");
  });

  it("When Owner of the asset does safe transfer with data the receiver contract reverts on call", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    const ERC721ReceiverMockFactory =
      await ethers.getContractFactory("ERC721ReceiverMock");
    erc721Receiver = await ERC721ReceiverMockFactory.deploy(
      RECEIVER_MAGIC_VALUE,
      RevertType.RevertWithMessage,
    );
    await erc721Receiver.waitForDeployment();
    const receiverContractAddress = await erc721Receiver.getAddress();

    await expect(
      erc721
        .connect(addr1)
        .safeTransferFrom(
          addr1.address,
          receiverContractAddress,
          tokenId,
          "0x43",
          { gasLimit: 300000 },
        ),
    ).to.be.revertedWith("ERC721ReceiverMock: reverting");
  });
});


describe("ERC721UpdatableBaseURI", function () {
  const defaultURI = "evochain1/collectionId/";

  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  let erc721: ERC721Universal;

  // Deploy the contract and prepare accounts
  beforeEach(async function () {
    [addr1, addr2] = await ethers.getSigners();

    const ERC721UniversalFactory = await ethers.getContractFactory(
      "ERC721Universal",
    );
    erc721 = await ERC721UniversalFactory.deploy(
      addr1.address,
      "laos-kitties",
      "LAK",
      defaultURI,
    );
    await erc721.waitForDeployment();
  });

  it("Should support the standard ERC721UpdatableBaseURI interface", async function () {
    const InterfaceIdFactory = await ethers.getContractFactory(
      "InterfaceId",
    );
    const interfaceId = await InterfaceIdFactory.deploy();
    await interfaceId.waitForDeployment();

    // Tests both via direct contract calls, as well the on-chain OpenZeppelin lib checker:
    const specified721Id = "0xb8382a4b";
    expect(await interfaceId.getERC721UpdatableBaseURIId()).to.equal(specified721Id);
    expect(await erc721.supportsInterface(specified721Id)).to.equal(true);
    expect(await interfaceId.supportsInterface(await erc721.getAddress(), specified721Id)).to.equal(true);
  });

  it("baseURI cannot be updated by address that is not owner", async function () {
    await expect(erc721.connect(addr2).updateBaseURI("new/mate"))
      .to.be.revertedWithCustomError(erc721, "OwnableUnauthorizedAccount")
      .withArgs(addr2.address);
  });

  it("updates to baseURI work", async function () {
    await erc721.connect(addr1).updateBaseURI("new/mate/");
    expect(await erc721.baseURI()).to.equal("new/mate/");
    await erc721.connect(addr1).updateBaseURI("old/mate/");
    expect(await erc721.baseURI()).to.equal("old/mate/");
    expect(await erc721.tokenURI(1)).to.equal("old/mate/GeneralKey(1)");
  });

  it("change in baseURI emits expected event", async function () {
    await expect(await erc721.connect(addr1).updateBaseURI("new/mate"))
      .to.emit(erc721, "UpdatedBaseURI")
      .withArgs("new/mate");
  });

  it("is not locked on deploy", async function () {
    expect(await erc721.isBaseURILocked()).to.equal(false);
  });

  it("onlyOwner can lock baseURI", async function () {
    await expect(erc721.connect(addr2).lockBaseURI())
      .to.be.revertedWithCustomError(erc721, "OwnableUnauthorizedAccount")
      .withArgs(addr2.address);
  });

  it("locking baseURI prevents further changes of baseURI", async function () {
    await expect(erc721.connect(addr1).lockBaseURI())
      .to.emit(erc721, "LockedBaseURI")
      .withArgs(defaultURI);

    await expect(erc721.connect(addr1).updateBaseURI("new/mate"))
      .to.be.revertedWithCustomError(erc721, "BaseURIAlreadyLocked")
      .withArgs();      
  });

  it("locking baseURI cannot be done twice", async function () {
    await expect(erc721.connect(addr1).lockBaseURI())
      .to.emit(erc721, "LockedBaseURI")
      .withArgs(defaultURI);

    await expect(erc721.connect(addr1).lockBaseURI())
      .to.be.revertedWithCustomError(erc721, "BaseURIAlreadyLocked")
      .withArgs();      
  });
});

describe("ERC721Broadcast", function () {
  const defaultURI = "evochain1/collectionId/";

  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  let erc721: ERC721Universal;

  // Deploy the contract and prepare accounts
  beforeEach(async function () {
    [addr1, addr2] = await ethers.getSigners();

    const ERC721UniversalFactory = await ethers.getContractFactory(
      "ERC721Universal",
    );
    erc721 = await ERC721UniversalFactory.deploy(
      addr1.address,
      "laos-kitties",
      "LAK",
      defaultURI,
    );
    await erc721.waitForDeployment();
  });

  it("Should support the standard ERC721Broadcast interface", async function () {
    const InterfaceIdFactory = await ethers.getContractFactory(
      "InterfaceId",
    );
    const interfaceId = await InterfaceIdFactory.deploy();
    await interfaceId.waitForDeployment();

    // Tests both via direct contract calls, as well the on-chain OpenZeppelin lib checker:
    const specified721Id = "0x9430f0b8";
    expect(await interfaceId.getERC721BroadcastId()).to.equal(specified721Id);
    expect(await erc721.supportsInterface(specified721Id)).to.equal(true);
    expect(await interfaceId.supportsInterface(await erc721.getAddress(), specified721Id)).to.equal(true);
  });

  it("wasEverTransferred returns false on non-transferred assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.wasEverTransferred(tokenId)).to.equal(false);
  });

  it("wasEverTransferred returns true on transferred assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, addr2.address, tokenId);
    expect(await erc721.wasEverTransferred(tokenId)).to.equal(true);
  });

  it("wasEverTransferred returns true on burned assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    const nullAddress = ethers.toBeHex(0, 20);
    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);
    expect(await erc721.wasEverTransferred(tokenId)).to.equal(true);
  });

  it("wasEverTransferred returns true on burned assets after having been transferred", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.wasEverTransferred(tokenId)).to.equal(false);
    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, addr2.address, tokenId);
    expect(await erc721.wasEverTransferred(tokenId)).to.equal(true);
    const nullAddress = ethers.toBeHex(0, 20);
    await expect(erc721.connect(addr2).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr2.address, nullAddress, tokenId);
    expect(await erc721.wasEverTransferred(tokenId)).to.equal(true);
  });

  it("broadcastMint works on non-transferred asset, and emits expected event", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    const nullAddress = ethers.toBeHex(0, 20);
    // note that the broadcasts are sent by any address; in this example, the address is not the owner of the asset
    await expect(erc721.connect(addr2).broadcastMint(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(nullAddress, addr1.address, tokenId);
  });

  it("broadcastSelfTransfer work on non-transferred asset, and emits expected event", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    // note that the broadcasts are sent by any address; in this example, the address is not the owner of the asset
    await expect(erc721.connect(addr2).broadcastSelfTransfer(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, addr1.address, tokenId);
   });

   it("broadcastSelfTransfer cost of gas is as expected", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    // note that the broadcasts are sent by any address; in this example, the address is not the owner of the asset
    const tx = await erc721.connect(addr2).broadcastSelfTransfer(tokenId);
    const receipt = await tx.wait();
    expect(receipt?.gasUsed).to.equal(28199);
  });

  it("broadcastMint cost of gas is as expected", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    // note that the broadcasts are sent by any address; in this example, the address is not the owner of the asset
    const tx = await erc721.connect(addr2).broadcastMint(tokenId);
    const receipt = await tx.wait();
    expect(receipt?.gasUsed).to.equal(28243);
  });

  it("broadcastMint reverts on transferred assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, addr2.address, tokenId);
    await expect(erc721.connect(addr2).broadcastMint(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721UniversalAlreadyTransferred")
      .withArgs(tokenId);
  });  

  it("broadcastSelfTransfer reverts on transferred assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    await expect(
      erc721.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, addr2.address, tokenId);
    await expect(erc721.connect(addr2).broadcastSelfTransfer(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721UniversalAlreadyTransferred")
      .withArgs(tokenId);
  });  

  it("broadcastMint reverts on burned assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    const nullAddress = ethers.toBeHex(0, 20);
    await expect(
      erc721.connect(addr1).burn(tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);
    await expect(erc721.connect(addr2).broadcastMint(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721UniversalAlreadyTransferred")
      .withArgs(tokenId);
  });

  it("broadcastSelfTransfer reverts on burned assets", async function () {
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    const nullAddress = ethers.toBeHex(0, 20);
    await expect(
      erc721.connect(addr1).burn(tokenId),
    )
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);
    await expect(erc721.connect(addr2).broadcastSelfTransfer(tokenId))
      .to.be.revertedWithCustomError(erc721, "ERC721UniversalAlreadyTransferred")
      .withArgs(tokenId);
  });
});