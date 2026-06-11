// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IWorkCertificateNFT {
    function mintCertificate(
        address recipient,
        uint256 projectId,
        string calldata title,
        address client,
        uint256 amount,
        uint256 completedAt
    ) external returns (uint256 tokenId);
}

contract WorkChainEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum ProjectStatus {
        Created,
        Funded,
        Accepted,
        Submitted,
        Completed,
        Refunded,
        Cancelled
    }

    struct Project {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        string title;
        string description;
        string proofUrl;
        uint256 createdAt;
        uint256 completedAt;
        ProjectStatus status;
    }

    error EmptyDescription();
    error EmptyProofUrl();
    error EmptyTitle();
    error InvalidAddress();
    error InvalidAmount();
    error InvalidStatus(ProjectStatus expected, ProjectStatus actual);
    error OnlyClient();
    error OnlyFreelancer();
    error ProjectNotFound();
    error UnsupportedPaymentToken();

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        string title
    );
    event ProjectFunded(uint256 indexed projectId, uint256 amount);
    event ProjectAccepted(uint256 indexed projectId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed projectId, string proofUrl);
    event ProjectCompleted(
        uint256 indexed projectId,
        address indexed freelancer,
        uint256 amount
    );
    event ProjectRefunded(
        uint256 indexed projectId,
        address indexed client,
        uint256 amount
    );
    event ProjectCancelled(uint256 indexed projectId, address indexed client);
    event CertificateMinted(
        uint256 indexed projectId,
        address indexed freelancer,
        uint256 tokenId
    );

    IERC20 public immutable paymentToken;
    IWorkCertificateNFT public immutable certificateNFT;
    uint256 public projectCount;

    mapping(uint256 projectId => Project project) private _projects;

    constructor(address paymentTokenAddress, address certificateNFTAddress) {
        if (
            paymentTokenAddress == address(0) ||
            certificateNFTAddress == address(0)
        ) revert InvalidAddress();

        paymentToken = IERC20(paymentTokenAddress);
        certificateNFT = IWorkCertificateNFT(certificateNFTAddress);
    }

    function createProject(
        string calldata title,
        string calldata description,
        address freelancer,
        uint256 amount
    ) external returns (uint256 projectId) {
        if (bytes(title).length == 0) revert EmptyTitle();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (
            freelancer == address(0) ||
            freelancer == msg.sender
        ) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        projectId = ++projectCount;
        _projects[projectId] = Project({
            id: projectId,
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            title: title,
            description: description,
            proofUrl: "",
            createdAt: block.timestamp,
            completedAt: 0,
            status: ProjectStatus.Created
        });

        emit ProjectCreated(
            projectId,
            msg.sender,
            freelancer,
            amount,
            title
        );
    }

    function fundProject(uint256 projectId) external nonReentrant {
        Project storage project = _getProject(projectId);
        _requireClient(project);
        _requireStatus(project, ProjectStatus.Created);

        uint256 balanceBefore = paymentToken.balanceOf(address(this));
        paymentToken.safeTransferFrom(msg.sender, address(this), project.amount);
        uint256 received = paymentToken.balanceOf(address(this)) - balanceBefore;
        if (received != project.amount) revert UnsupportedPaymentToken();

        project.status = ProjectStatus.Funded;
        emit ProjectFunded(projectId, project.amount);
    }

    function acceptProject(uint256 projectId) external {
        Project storage project = _getProject(projectId);
        _requireFreelancer(project);
        _requireStatus(project, ProjectStatus.Funded);

        project.status = ProjectStatus.Accepted;
        emit ProjectAccepted(projectId, msg.sender);
    }

    function submitWork(uint256 projectId, string calldata proofUrl) external {
        Project storage project = _getProject(projectId);
        _requireFreelancer(project);
        _requireStatus(project, ProjectStatus.Accepted);
        if (bytes(proofUrl).length == 0) revert EmptyProofUrl();

        project.proofUrl = proofUrl;
        project.status = ProjectStatus.Submitted;
        emit WorkSubmitted(projectId, proofUrl);
    }

    function approveWork(uint256 projectId) external nonReentrant {
        Project storage project = _getProject(projectId);
        _requireClient(project);
        _requireStatus(project, ProjectStatus.Submitted);

        project.status = ProjectStatus.Completed;
        project.completedAt = block.timestamp;

        paymentToken.safeTransfer(project.freelancer, project.amount);
        uint256 tokenId = certificateNFT.mintCertificate(
            project.freelancer,
            project.id,
            project.title,
            project.client,
            project.amount,
            project.completedAt
        );

        emit ProjectCompleted(projectId, project.freelancer, project.amount);
        emit CertificateMinted(projectId, project.freelancer, tokenId);
    }

    function refundProject(uint256 projectId) external nonReentrant {
        Project storage project = _getProject(projectId);
        _requireClient(project);
        _requireStatus(project, ProjectStatus.Funded);

        project.status = ProjectStatus.Refunded;
        paymentToken.safeTransfer(project.client, project.amount);

        emit ProjectRefunded(projectId, project.client, project.amount);
    }

    function cancelProject(uint256 projectId) external {
        Project storage project = _getProject(projectId);
        _requireClient(project);
        _requireStatus(project, ProjectStatus.Created);

        project.status = ProjectStatus.Cancelled;
        emit ProjectCancelled(projectId, project.client);
    }

    function getProject(uint256 projectId) external view returns (Project memory) {
        return _getProject(projectId);
    }

    function _getProject(uint256 projectId) private view returns (Project storage project) {
        project = _projects[projectId];
        if (project.id == 0) revert ProjectNotFound();
    }

    function _requireClient(Project storage project) private view {
        if (msg.sender != project.client) revert OnlyClient();
    }

    function _requireFreelancer(Project storage project) private view {
        if (msg.sender != project.freelancer) revert OnlyFreelancer();
    }

    function _requireStatus(
        Project storage project,
        ProjectStatus expected
    ) private view {
        if (project.status != expected) {
            revert InvalidStatus(expected, project.status);
        }
    }
}

