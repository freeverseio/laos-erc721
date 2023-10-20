// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "../IERC721BridgelessMinting.sol";

/**
 * @title Test contract for the purpose of verifying the interfaces
 *  supported by the IERC721BridgelessMinting contract
 * @author Freeverse.io, www.freeverse.io
 */

contract InterfaceId {
    function getERC721Id() public pure returns(bytes4) {
        return type(IERC721).interfaceId;
    }

    function getERC721BridgelessMintingId() public pure returns(bytes4) {
        return type(IERC721BridgelessMinting).interfaceId;
    }

    function supportsERC165(address _contractAddress) external view returns (bool) {
        return ERC165Checker.supportsERC165(_contractAddress);
    }

    function supportsInterface(address _contractAddress, bytes4 _interfaceId) external view returns (bool) {
        return ERC165Checker.supportsInterface(_contractAddress, _interfaceId);
    }
}
