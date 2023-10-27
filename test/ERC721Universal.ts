// Import necessary Hardhat and ethers.js components
import { expect } from "chai";
import { ethers } from "hardhat";

import { RevertType } from "../utils/enums.ts";

import { ERC721UniversalMinting } from "../typechain-types/contracts/ERC721UniversalMinting.js";
import { ERC721ReceiverMock } from "../typechain-types/contracts/tests/ERC721ReceiverMock.js";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ERC721UniversalMinting", function () {
  const maxBalance = 2n ** 96n;
  const defaultURI = "evochain1/collectionId/";

  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addr3: HardhatEthersSigner;

  let erc721: ERC721UniversalMinting;
  let erc721Receiver: ERC721ReceiverMock;

  const RECEIVER_MAGIC_VALUE = "0x150b7a02";

  // Deploy the contract and prepare accounts
  beforeEach(async function () {
    [addr1, addr2, addr3] = await ethers.getSigners();

    const ERC721UniversalFactory = await ethers.getContractFactory(
      "ERC721UniversalMinting",
    );
    erc721 = await ERC721UniversalFactory.deploy(
      "laos-kitties",
      "LAK",
      defaultURI,
    );
    await erc721.waitForDeployment();
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

  it("Should support universal minting ERC721 interface", async function () {
    const InterfaceIdFactory = await ethers.getContractFactory(
      "InterfaceId",
    );
    const interfaceId = await InterfaceIdFactory.deploy();
    await interfaceId.waitForDeployment();

    // Tests both via direct contract calls, as well the on-chain OpenZeppelin lib checker:
    const specified721UniversalId = "0x57854508";
    expect(await interfaceId.getERC721UniversalId()).to.equal(specified721UniversalId);
    expect(await erc721.supportsInterface(specified721UniversalId)).to.equal(true);
    expect(await interfaceId.supportsInterface(await erc721.getAddress(), specified721UniversalId)).to.equal(true);
  });

  it("Should emit expected event on deploy", async function () {
    const deployedTx = erc721.deploymentTransaction();
    const deployedAddress = await erc721.getAddress();
    await expect(deployedTx)
      .to.emit(erc721, "NewERC721Universal")
      .withArgs(deployedAddress, defaultURI);
  });

  it("Should have the correct name and symbol", async function () {
    const name = await erc721.name();
    const symbol = await erc721.symbol();

    expect(name).to.equal("laos-kitties");
    expect(symbol).to.equal("LAK");
  });

  it("Should return correct tokenURI", async function () {
    const tokenId = 1;
    expect(await erc721.tokenURI(tokenId)).to.equal(defaultURI + tokenId);

    const slot = "34";
    const largeTokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    const largeTokenIdAsUint256 = ethers.toBigInt(largeTokenId);
    expect(await erc721.tokenURI(largeTokenId)).to.equal(
      defaultURI + largeTokenIdAsUint256.toString(),
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

  it("Owner of the asset should be burn asset", async function () {
    const nullAddress = ethers.toBeHex(0, 20);
    const slot = "111";
    const tokenId = ethers.toBeHex(
      "0x" + slot + addr1.address.substring(2),
      32,
    );
    expect(await erc721.ownerOf(tokenId)).to.equal(addr1.address);

    expect(await erc721.balanceOf(addr1.address)).to.equal(maxBalance);

    await expect(erc721.connect(addr1).burn(tokenId))
      .to.emit(erc721, "Transfer")
      .withArgs(addr1.address, nullAddress, tokenId);

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
