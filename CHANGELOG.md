# Changelog

All breaking changes to this project will be documented in this file.

## v0.1.0 - 2023/12/05

This version introduces the `ERC721UniversalVersion()` method for the first time, which returns `1`. Consider using this method to determine the contract version for support purposes.

Breaking changes:

1. **Interface change**. The constructor of the ERC721Universal smart contract now takes an extra parameter `owner`. Previously, there was no owner at all, because there was no method that required any privilege. The new methods that require it are `updateBaseURI`, `lockBaseURI`. This is the constructor now:
```
    constructor(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    )
```

2. **InterfaceId change**. The new `interfaceId` for the uERC721 is `0x9832f941`.


