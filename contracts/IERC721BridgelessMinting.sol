// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Required interface of an ERC721LAOS compliant contract.
 */
interface IERC721BridgelessMinting {
    /**
     * @dev Emitted when `defaultOperator` is set.
     */
    event SetDefaultOperator(address defaultOperator);

    /**
     * @dev sets default operator which is an address unanimously approved by
     * all owners, to facilitate the transfer of their tokens.
     * @param defaultOperator_ the default operator
     */
    function setDefaultOperator(address defaultOperator_) external;
}
