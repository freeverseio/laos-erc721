// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC-721 Non-Fungible Token Standard, optional broadcastMint extension
 * @dev The ERC-165 identifier for this interface is 0x8f8376c4
 * @author Freeverse.io, www.freeverse.io
 */
interface IERC721Broadcast {
    /**
     * @dev Indicates an error related to the fact that a token was already transferred at least once
     * @param tokenId The id of the token
     */
    error ERC721UniversalAlreadyTransferred(uint256 tokenId);

    /**
     * @notice For a token that has never been transferred, it just emits an
     *  ERC721 Transfer event from the null address to the initial owner,
     *  to inform DApps that listen for mints.
     *  The method must not change the state in any other way.
     * @dev This function must revert if the token has ever been transferred,
     *  at least once, since in that case, DApps are already aware of the current
     *  owner, and by extension, about the initial mint of the asset.
     *  Since burning involves transferring to the null address, the method must also
     *  revert if the token has been burned.
     * @param tokenId the id of the token to be broadcast
     */
    function broadcastMint(uint256 tokenId) external;

    /**
     * @notice For a token that has never been transferred, it just emits an
     *  ERC721 Transfer event from the owner address to itself,
     *  to inform DApps that display minted assets by listening to Transfer events,
     *  and then checking the previous and new owners against the contract state.
     *  The method must not change the state in any other way.
     * @dev This function must revert if the token has ever been transferred,
     *  at least once, since in that case, DApps are already aware of the current
     *  owner, and by extension, about the initial mint of the asset.
     *  Since burning involves transferring to the null address, the method must also
     *  revert if the token has been burned.
     * @param tokenId the id of the token to be broadcast
     */
    function broadcastSelfTransfer(uint256 tokenId) external;

    /**
     * @notice For a set of tokens that have never been transferred, for each token,
     *  it emits an ERC721 Transfer event from the null address to the initial owner,
     *  to inform DApps that listen for mints.
     *  The method must not change the state in any other way.
     * @dev This function must revert if any of the tokens has ever been transferred,
     *  at least once, since in that case, DApps are already aware of the current
     *  owner, and by extension, about the initial mint of the asset.
     *  Since burning involves transferring to the null address, the method must also
     *  revert if any of the tokens has been burned.
     * @param tokenIds the array with the ids of the tokens to be broadcast
     */
    function broadcastMintBatch(uint256[] calldata tokenIds) external;

    /**
     * @notice For a set of tokens that have never been transferred, for each token,
     *  it emits an ERC721 Transfer event from the owner address to itself,
     *  to inform DApps that listen for mints.
     *  The method must not change the state in any other way.
     * @dev This function must revert if any of the tokens has ever been transferred,
     *  at least once, since in that case, DApps are already aware of the current
     *  owner, and by extension, about the initial mint of the asset.
     *  Since burning involves transferring to the null address, the method must also
     *  revert if any of the tokens has been burned.
     * @param tokenIds the array with the ids of the tokens to be broadcast
     */
    function broadcastSelfTransferBatch(uint256[] calldata tokenIds) external;

    /**
     * @notice Returns true if the token has already been transferred at least once
     * @dev Since burning involves transferring to the null address,
     *  the method must return true if the token has been burned.
     * @param tokenId the id of the token to be broadcast
     * @return true if the token was ever transferred
     */
    function wasEverTransferred(uint256 tokenId) external view returns (bool);
}
