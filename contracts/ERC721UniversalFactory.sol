// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./ERC721Universal.sol";

/**
 * @title Contract for Deploying ERC721Universal tokens
 * @dev This contract deploys a ERC1967Proxy for ERC721Universal tokens
 */
contract ERC721UniversalFactory {
    address public immutable implementation;

    constructor() {
        implementation = address(new ERC721Universal());
    }

    function deployERC721Universal(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) external returns (address proxy) {
        (bytes32 salt, bytes memory deployData) = _getDeployParams(owner_, name_, symbol_, baseURI_);
        proxy = Create2.deploy(0, salt, deployData);
        return proxy;
    }

    function determineProxyAddress(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) public view returns (address) {
        (bytes32 salt, bytes memory deployData) = _getDeployParams(owner_, name_, symbol_, baseURI_);
        return Create2.computeAddress(salt, keccak256(deployData));
    }

    function _getDeployParams(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) public view returns (bytes32 salt, bytes memory deployData) {
        salt = keccak256(abi.encodePacked(owner_, name_, symbol_, baseURI_));
        bytes memory initData = abi.encodeWithSelector(ERC721Universal.initialize.selector, owner_, name_, symbol_, baseURI_);
        deployData = abi.encodePacked(type(ERC1967Proxy).creationCode, abi.encode(implementation, initData));
        return (salt, deployData);
    }

}
