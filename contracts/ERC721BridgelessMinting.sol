// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title Contract for bridgeless minting of ERC721 tokens
 * @author Freeverse.io, www.freeverse.io
 * @dev The contract is an extension of OpenZeppelin ERC721
 * @dev The contract allocates 2^96 slots to every possible 160b address,
 * @dev to be filled in the Evolution consensus system
 * @dev The contract has possibility of adding default operator that can change token ownership
 */

contract ERC721BridgelessMinting is ERC721 {

    // the map that returns true for tokens that have been burned
    mapping(uint256 tokenId => bool) public isBurnedToken;

    // the string prepended to tokenId to return tokenURI
    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) {
        baseURI = baseURI_;
    }

    /**
     * @notice Burns `tokenId`
     *
     * @dev The caller must own `tokenId` or be an approved operator.
     *
     * @param tokenId the id of the token to be burned
     */
    function burn(uint256 tokenId) public virtual {
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        _update(address(0), tokenId, _msgSender());
        isBurnedToken[tokenId] = true;
    }

    /**
     * @notice Returns the amount of tokens owned by an address 
     * @dev This function overrides the one from the base ERC721 contract to
     * ensure that the maxBalance is always returned, since all slots are allocated
     * on deploy, and tradable.
     *
     * @param owner the address of the owner for which the balance is queried
     * @return the balance of the owner provided in the query
     */
    function balanceOf(address owner) public pure override returns (uint256) {
        return 2**96;
    }

    /**
     * @notice Returns the initial owner address which is encoded in the tokenId 
     * @dev This function returns the same value regardless of whether the token
     *  has been transferred once or more times.
     *  Use ownerOf() to query current owner of an token, as opposed to the
     *  init owner. 
     *  The init owner are encoded as the right-most 160 bit of tokenId 
     *
     * @param tokenId the id of the token for which the initial owner is queried
     * @return the initial owner of the token
     */
    function initOwner(uint256 tokenId)
        public
        pure
        returns (address)
    {
        return address(uint160(tokenId));
    }

    /**
     * @notice Returns the baseURI used to build the tokenURI
     * @dev The function overrides the one in the base ERC721 contract,
     *  to return the correct baseURI. 
     * @return the baseURI used to build the tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Returns the current owner of a token
     * @dev The function overrides the one in the base ERC721 contract,
     *  and it returns the token's correct owner if the token has never been previously transferred.
     * 
     * @param tokenId the id of the token for which the owner is queried
     * @return the current owner of the token
     */
    function _ownerOf(
        uint256 tokenId
    ) internal view override returns (address) {
        if (isBurnedToken[tokenId]) return address(0);
        address _storageOwner = super._ownerOf(tokenId);
        return (_storageOwner == address(0)) ? initOwner(tokenId) : _storageOwner;
    }
}
