// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Interface to contract for Universal Minting and Evolution of ERC721 tokens
 * @dev The ERC-165 identifier for this interface is 0x57854508
 * @author Freeverse.io, www.freeverse.io
 */
interface IERC721Universal {
    /**
     * @notice Event emitted on contract deployment
     * @param newContractAddress the address of the newly deployed contract
     * @param baseURI the baseURI string provided on the deploy transaction
     */
    event NewERC721Universal(
        address newContractAddress,
        string baseURI
    );

    /**
     * @notice Returns the initial owner address that must be encoded in tokenId
     * @dev This function returns the same value regardless of whether the
     *  token has been transferred once or more times.
     *  The standard ERC721 method ownerOf() must continue to be used to query
     *  the current owner of an token, as opposed to the initial owner.
     * @dev The init owner is encoded as the right-most 160 bit of tokenId
     * @param tokenId the id of the token for which the initial owner is queried
     * @return the initial owner of the token
     */
    function initOwner(uint256 tokenId) external pure returns (address);
}
