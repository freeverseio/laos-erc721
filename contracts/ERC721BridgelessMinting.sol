// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title Contract for bridgeless minting of ERC721 tokens
 * @author Freeverse.io, www.freeverse.io
 * @dev The contract is an extension of OpenZeppelin ERC721
 * @dev The contract allocates 2^96 slots to every possible 160b address,
 * @dev to be filled in the Evolution consensus system
 * @dev The contract has possibility of adding default operator that can change asset ownership
 */

// TODO: implement burn
// TODO: check exists() usage

// consider inheriting less than ERC721, since mint is not needed
contract ERC721BridgelessMinting is ERC721 {

    mapping(uint256 tokenId => bool) public isBurnedToken;

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) {
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
     * TODO: review and add params
     */
    function _ownerOf(
        uint256 tokenId
    ) internal view override returns (address) {
        if (isBurnedToken[tokenId]) return address(0);

        address _storageOwner = super._ownerOf(tokenId);
        return (_storageOwner == address(0)) ? initOwner(tokenId) : _storageOwner;
    }

    // /**
    //  * @dev The function overrides the one in the base ERC721 contract to
    //  * assign a default balance of 2^97-1 to the 'from' and 'to' addresses,
    //  * given that no transfers have been made by them so far.
    //  */
    // function transferFrom(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) public override {
    //     if (!addressTransferredOnce[from]) {
    //         super._increaseBalance(from, defaultBalance);
    //         addressTransferredOnce[from] = true;
    //     }

    //     if (!addressTransferredOnce[to]) {
    //         super._increaseBalance(to, defaultBalance);
    //         addressTransferredOnce[to] = true;
    //     }

    //     super.transferFrom(from, to, tokenId);
    //     tokenTransferredOnce[tokenId] = true;
    // }

    /**
     * @dev The function overrides the one from the base ERC721 contract to
     * ensure that the defaultBalance is returned when the owner has not made
     * any asset transfers previously.
     */
    function balanceOf(address owner) public pure override returns (uint256) {
        return 2**96;
    }

// TODO: add comment
    function initOwner(uint256 tokenId)
        public
        pure
        returns (address)
    {
        return address(uint160(tokenId));
    }

    
}
