// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../contracts/IERC721BridgelessMinting.sol";

/**
 * @title The contract used for bridgeless minting of ERC721 tokens
 * @author Freeverse.io, www.freeverse.io
 * @dev The contract is an extension of OpenZeppelin ERC721 and Ownable contracts
 * @dev The contract pre-mints 2^96 assets (slots) for each address.
 * @dev The contract has possibility of adding default operator that can change asset ownership
 */
contract ERC721BridgelessMinting is ERC721, Ownable, IERC721BridgelessMinting {
    mapping(uint256 tokenId => bool) private tokenTransferredOnce;
    mapping(address owner => bool) private addressTransferredOnce;
    string public baseURI;
    address public defaultOperator;
    uint128 private constant defaultBalance = 2 ** 97 - 1;

    constructor(
        address initialOwner,
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) Ownable(initialOwner) {
        baseURI = baseURI_;
    }

    /**
     * @dev The function overrides the one in the base ERC721 contract,
     * to return the correct baseURI. 
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev The function overrides the one in the base ERC721 contract,
     * and it returns the asset's correct owner if the asset has never been previously transferred.
     */
    function _ownerOf(
        uint256 tokenId
    ) internal view override returns (address) {
        if (!tokenTransferredOnce[tokenId]) {
            return address(uint160(tokenId));
        }
        return super._ownerOf(tokenId);
    }

    /**
     * @dev The function overrides the one in the base ERC721 contract to
     * assign a default balance of 2^97-1 to the 'from' and 'to' addresses,
     * given that no transfers have been made by them so far.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        if (!addressTransferredOnce[from]) {
            super._increaseBalance(from, defaultBalance);
            addressTransferredOnce[from] = true;
        }

        if (!addressTransferredOnce[to]) {
            super._increaseBalance(to, defaultBalance);
            addressTransferredOnce[to] = true;
        }

        super.transferFrom(from, to, tokenId);
        tokenTransferredOnce[tokenId] = true;
    }

    /**
     * @dev The function overrides the one from the base ERC721 contract to
     * enable support for the defaultOperator feature
     */
    function isApprovedForAll(
        address owner,
        address operator
    ) public view override returns (bool) {
        if (operator != address(0) && operator == defaultOperator) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    /**
     * @dev The function overrides the one from the base ERC721 contract to
     * ensure that the defaultBalance is returned when the owner has not made
     * any asset transfers previously.
     */
    function balanceOf(address owner) public view override returns (uint256) {
        if (!addressTransferredOnce[owner]) {
            return defaultBalance;
        }
        return super.balanceOf(owner);
    }

    /// @inheritdoc IERC721BridgelessMinting
    function setDefaultOperator(address defaultOperator_) external onlyOwner {
        require(
            defaultOperator_ != address(0),
            "defaultOperator cannot be 0x0 address"
        );
        defaultOperator = defaultOperator_;

        emit SetDefaultOperator(defaultOperator_);
    }
}
