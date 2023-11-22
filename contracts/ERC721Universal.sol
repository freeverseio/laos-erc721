// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC721Universal.sol";
import "./IERC721UpdatableBaseURI.sol";

/**
 * @title Contract for Universal Minting and Evolution of ERC721 tokens
 * @author Freeverse.io, www.freeverse.io
 * @dev This contract is an extension of the OpenZeppelin ERC721 implementation.
 *  On deploy, this contract allocates 2^96 slots to every possible 160b address,
 *  which are then filled and evolved in the Mint/Evolution consensus system.
 *  The null address is the only address that cannot own any slot; as usual,
 *  it is used as the target address of the transfer executed within the burn method.
 */
contract ERC721Universal is
    IERC721Universal,
    IERC721UpdatableBaseURI,
    ERC721,
    Ownable
{
    /// @inheritdoc IERC721Universal
    uint32 public constant ERC721UniversalVersion = 1;

    // if true, the baseURI cannot be changed ever again
    bool public isBaseURILocked;

    // the map that returns true for tokens that have been burned
    mapping(uint256 tokenId => bool) public isBurnedToken;

    // the string prepended to tokenId to return tokenURI
    string private __baseURI;

    constructor(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        __baseURI = baseURI_;
        emit NewERC721Universal(address(this), baseURI_);
    }

    /**
     * @notice Burns `tokenId`
     * @dev The caller must own `tokenId` or be an approved operator.
     * @param tokenId the id of the token to be burned
     */
    function burn(uint256 tokenId) public virtual {
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        _update(address(0), tokenId, _msgSender());
        isBurnedToken[tokenId] = true;
    }

    /// @inheritdoc IERC721UpdatableBaseURI
    function updateBaseURI(string calldata newBaseURI) external onlyOwner {
        if (isBaseURILocked) revert BaseURIAlreadyLocked();
        __baseURI = newBaseURI;
        emit UpdatedBaseURI(newBaseURI);
    }

    /// @inheritdoc IERC721UpdatableBaseURI
    function lockBaseURI() external onlyOwner {
        if (isBaseURILocked) revert BaseURIAlreadyLocked();
        isBaseURILocked = true;
        emit LockedBaseURI(__baseURI);
    }

    /**
     * @notice Returns the amount of slots initially owned by an address
     * @dev In the bridgless minting pattern, the correct balance of an owned
     *  is returned by the separate consensus system, for example, via usage of
     *  a Universal Node. However, since this method is mandatory in the ERC721 standard,
     *  the only requirement is that the concrete implementation must simply not fail.
     *  The returned value can be an arbitrary constant which should not be used directly
     *  by any other application.
     * @param _owner the address of the owner for which the balance is queried
     * @return an arbitrary number that should not be used directly.
     */
    function balanceOf(address _owner) public pure override returns (uint256) {
        return 2 ** 96;
    }

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
    function initOwner(uint256 tokenId) public pure returns (address) {
        return address(uint160(tokenId));
    }

    /**
     * @notice Returns true if the contract implements an interface
     * @dev Extends the interfaces specified by the standard ERC721
     *  to additionally respond true when queried about the Id of the
     *  Universal Minting interface
     *  Adheres to the ERC165 standard.
     * @param interfaceId the id of the interface
     * @return true if this contract implements the interface defined by interfaceId
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC721UpdatableBaseURI).interfaceId ||
            interfaceId == type(IERC721Universal).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Returns the baseURI used to build the tokenURI
     * @return the baseURI used to build the tokenURI
     */
    function baseURI() external view returns (string memory) {
        return __baseURI;
    }

    /**
     * @notice Returns the baseURI used to build the tokenURI
     * @dev This function overrides the one in the base ERC721 contract, to
     *  return the correct baseURI.
     * @return the baseURI used to build the tokenURI
     */
    function _baseURI() internal view override returns (string memory) {
        return __baseURI;
    }

    /**
     * @notice Returns the current owner of a token
     * @dev This function overrides the one in the base ERC721 contract. On
     *  deploy, all tokens have an assigned owner, encoded in their tokenId, and
     *  determined via usage of initOwner(tokenId). Upon transfer, the new owner
     *  is stored in, and retrieved from, the contract storage.
     * @param tokenId the id of the token for which the owner is queried
     * @return the current owner of the token
     */
    function _ownerOf(
        uint256 tokenId
    ) internal view override returns (address) {
        if (isBurnedToken[tokenId]) return address(0);
        address _storageOwner = super._ownerOf(tokenId);
        return
            (_storageOwner == address(0)) ? initOwner(tokenId) : _storageOwner;
    }
}
