// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../IERC721BridgelessMinting.sol";

contract InterfaceId {
    function getERC721Id() public pure returns(bytes4) {
        return type(IERC721).interfaceId;
    }

    function getERC721BridgelessMintingId() public pure returns(bytes4) {
        return type(IERC721BridgelessMinting).interfaceId;
    }
}
