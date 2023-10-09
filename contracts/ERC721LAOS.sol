// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ERC721LAOS is ERC721, Ownable {
    constructor(address initialOwner) 
    ERC721("ERC721LAOS", "EC")
    Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "evochain1/collectionId/";
    }

    function _ownerOf(uint256 tokenId) internal view override returns (address) {
        return super._ownerOf(tokenId);
    }

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

}
