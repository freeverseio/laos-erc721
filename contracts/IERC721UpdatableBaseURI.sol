// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Interface for ERC721 contracts which use a baseURI string
 *  to generate the tokenURI programmatically. It provides essential
 *  functions for managing the baseURI string, as well as the prefix and
 *  suffix strings placed before & after the tokenId to build the tokenURI
 * @dev The ERC-165 identifier for this interface is 0x418fb255
 * @author Freeverse.io, www.freeverse.io
 */
interface IERC721UpdatableBaseURI {
    /**
     * @dev The method cannot be called if the baseURI is already locked
     */
    error BaseURIAlreadyLocked();

    /**
     * @notice Event emitted on update of the baseURI
     * @param newBaseURI the newly set baseURI
     */
    event UpdatedBaseURI(string newBaseURI);

    /**
     * @notice Event emitted on permanent lock of baseURI
     * @param baseURI the baseURI that is now permanently locked
     */
    event LockedBaseURI(string baseURI);

    /**
     * @notice Event emitted on update of tokenId prefix and suffix
     * @param newPrefix the new string to be placed before the tokenId
     * @param newSuffix the new string to be placed after the tokenId
      */
    event UpdatedTokenIdAffixes(string newPrefix, string newSuffix);

    /**
     * @notice Updates the baseURI that is used to build the tokenURIs
     * @dev Only the owner of the ERC721 must is authorized to call this method
     * @dev This method reverts if the baseURI is locked
     * @param newBaseURI the baseURI to be used to build the tokenURIs
     */
    function updateBaseURI(string calldata newBaseURI) external;

    /**
     * @notice Prevents any further change of the baseURI, permanently, by any actor
     * @dev Only the owner of the ERC721 must is authorized to call this method
     * @dev This method reverts if the baseURI is locked
     */
    function lockBaseURI() external;

    /**
     * @notice Updates the prefix and suffix strings placed around the tokenId to build the tokenURI
     * @dev Only the owner of the ERC721 must is authorized to call this method
     * @dev This method reverts if the baseURI is locked
     * @param newPrefix the new string to be placed before the tokenId
     * @param newSuffix the new string to be placed after the tokenId
     */
    function updateTokenIdAffixes(string calldata newPrefix, string calldata newSuffix) external;

    /**
     * @notice Returns true if the baseURI is permanently locked
     * @return true if the baseURI is permanently locked
     */
    function isBaseURILocked() external view returns (bool);
}
