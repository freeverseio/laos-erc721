// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC-721 Non-Fungible Token Standard, optional broadcast extension
 * @author Freeverse.io, www.freeverse.io
 */
interface IERC721Broadcast {
    /**
     * @notice For tokens that have never been transferred, it just emits an
     *  ERC721 Transfer event from the null address to the initial owner,
     *  to inform DApps that listen for mints.
     *  The method must not change the state in any other way.
     * @dev This function must revert if the token has ever been transferred,
     *  at least once, since it that case, DApps are already aware of the current
     *  owner, and by extension, about the initial mint of the asset.
     *  Since burning involves transferring to the null address, the method must also
     *  revert if the token has been burned.
     * @param tokenId the id of the token to be broadcasted
     */
    function broadcast(uint256 tokenId) external;

    /**
     * @notice Returns true if the token has already been transferred at least once 
     * @dev Since burning involves transferring to the null address,
     *  the method must return true if the token has been burned.
     * @param tokenId the id of the token to be broadcasted
     */
    function wasEverTransferred(uint256 tokenId) external view returns(bool);

}
