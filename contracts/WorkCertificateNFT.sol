// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract WorkCertificateNFT is ERC721Enumerable, Ownable {
    using Strings for address;
    using Strings for uint256;
    using Strings for string;

    struct Certificate {
        uint256 projectId;
        string title;
        address client;
        address freelancer;
        uint256 amount;
        uint256 completedAt;
    }

    error EmptyImageURI();
    error EscrowAlreadySet();
    error InvalidEscrow();
    error OnlyEscrow();
    error ProjectAlreadyCertified();

    string public imageURI;
    address public escrow;

    mapping(uint256 tokenId => Certificate certificate) private _certificates;
    mapping(uint256 projectId => bool minted) public projectCertified;

    constructor(string memory certificateImageURI)
        ERC721("WorkChain Certificate", "WORK")
        Ownable(msg.sender)
    {
        if (bytes(certificateImageURI).length == 0) revert EmptyImageURI();
        imageURI = certificateImageURI;
    }

    modifier onlyEscrow() {
        if (msg.sender != escrow) revert OnlyEscrow();
        _;
    }

    function setEscrow(address escrowAddress) external onlyOwner {
        if (escrow != address(0)) revert EscrowAlreadySet();
        if (escrowAddress == address(0)) revert InvalidEscrow();
        escrow = escrowAddress;
    }

    function mintCertificate(
        address recipient,
        uint256 projectId,
        string calldata title,
        address client,
        uint256 amount,
        uint256 completedAt
    ) external onlyEscrow returns (uint256 tokenId) {
        if (projectCertified[projectId]) revert ProjectAlreadyCertified();

        tokenId = projectId;
        projectCertified[projectId] = true;
        _certificates[tokenId] = Certificate({
            projectId: projectId,
            title: title,
            client: client,
            freelancer: recipient,
            amount: amount,
            completedAt: completedAt
        });
        _safeMint(recipient, tokenId);
    }

    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        _requireOwned(tokenId);
        return _certificates[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        Certificate storage certificate = _certificates[tokenId];

        bytes memory metadata = abi.encodePacked(
            '{"name":"WorkChain Certificate #',
            tokenId.toString(),
            " - ",
            certificate.title.escapeJSON(),
            '","description":"Verified freelance work completed through WorkChain escrow.",',
            '"image":"',
            imageURI,
            '","attributes":[',
            '{"trait_type":"Project ID","value":"',
            certificate.projectId.toString(),
            '"},',
            '{"trait_type":"Client","value":"',
            certificate.client.toHexString(),
            '"},',
            '{"trait_type":"Freelancer","value":"',
            certificate.freelancer.toHexString(),
            '"},',
            '{"trait_type":"Amount (wei)","value":"',
            certificate.amount.toString(),
            '"},',
            '{"display_type":"date","trait_type":"Completed At","value":',
            certificate.completedAt.toString(),
            "}]}"
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(metadata)
            )
        );
    }
}
