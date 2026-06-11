import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";

describe("WorkChain", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  const INITIAL_SUPPLY = parseEther("1000000");
  const PROJECT_AMOUNT = parseEther("250");
  const IMAGE_URI = "ipfs://bafy-workchain-certificate";

  async function deployFixture() {
    const [deployer, client, freelancer, outsider] =
      await viem.getWalletClients();

    const token = await viem.deployContract("WorkChainToken", [
      INITIAL_SUPPLY,
    ]);
    const certificate = await viem.deployContract("WorkCertificateNFT", [
      IMAGE_URI,
    ]);
    const escrow = await viem.deployContract("WorkChainEscrow", [
      token.address,
      certificate.address,
    ]);

    await certificate.write.setEscrow([escrow.address]);

    return {
      deployer,
      client,
      freelancer,
      outsider,
      token,
      certificate,
      escrow,
    };
  }

  async function createProject(
    fixture: Awaited<ReturnType<typeof deployFixture>>,
    title = "Build WorkChain UI",
  ) {
    const { client, freelancer, escrow } = fixture;

    await escrow.write.createProject(
      [
        title,
        "Implement the approved dashboard design.",
        freelancer.account.address,
        PROJECT_AMOUNT,
      ],
      { account: client.account },
    );

    return 1n;
  }

  async function fundProject(
    fixture: Awaited<ReturnType<typeof deployFixture>>,
    projectId = 1n,
  ) {
    const { deployer, client, token, escrow } = fixture;

    await token.write.transfer(
      [client.account.address, PROJECT_AMOUNT],
      { account: deployer.account },
    );
    await token.write.approve(
      [escrow.address, PROJECT_AMOUNT],
      { account: client.account },
    );
    await escrow.write.fundProject([projectId], { account: client.account });
  }

  async function submitProject(
    fixture: Awaited<ReturnType<typeof deployFixture>>,
    title = "Build WorkChain UI",
  ) {
    const projectId = await createProject(fixture, title);
    await fundProject(fixture, projectId);

    await fixture.escrow.write.acceptProject(
      [projectId],
      { account: fixture.freelancer.account },
    );
    await fixture.escrow.write.submitWork(
      [projectId, "https://example.com/work/1"],
      { account: fixture.freelancer.account },
    );

    return projectId;
  }

  it("deploys WCT with the expected metadata and initial supply", async function () {
    const { deployer, token } = await deployFixture();

    assert.equal(await token.read.name(), "WorkChain Token");
    assert.equal(await token.read.symbol(), "WCT");
    assert.equal(await token.read.totalSupply(), INITIAL_SUPPLY);
    assert.equal(
      await token.read.balanceOf([deployer.account.address]),
      INITIAL_SUPPLY,
    );
  });

  it("creates a project and emits ProjectCreated", async function () {
    const fixture = await deployFixture();
    const { client, freelancer, escrow } = fixture;

    await viem.assertions.emitWithArgs(
      escrow.write.createProject(
        [
          "Build WorkChain UI",
          "Implement the approved dashboard design.",
          freelancer.account.address,
          PROJECT_AMOUNT,
        ],
        { account: client.account },
      ),
      escrow,
      "ProjectCreated",
      [
        1n,
        client.account.address,
        freelancer.account.address,
        PROJECT_AMOUNT,
        "Build WorkChain UI",
      ],
    );

    const project = await escrow.read.getProject([1n]);
    assert.equal(project.id, 1n);
    assert.equal(getAddress(project.client), getAddress(client.account.address));
    assert.equal(
      getAddress(project.freelancer),
      getAddress(freelancer.account.address),
    );
    assert.equal(project.amount, PROJECT_AMOUNT);
    assert.equal(project.status, 0);
    assert.equal(await escrow.read.projectCount(), 1n);
  });

  it("funds, accepts, and submits work through valid state transitions", async function () {
    const fixture = await deployFixture();
    const projectId = await createProject(fixture);

    await fundProject(fixture, projectId);
    assert.equal(
      await fixture.token.read.balanceOf([fixture.escrow.address]),
      PROJECT_AMOUNT,
    );
    assert.equal((await fixture.escrow.read.getProject([projectId])).status, 1);

    await viem.assertions.emitWithArgs(
      fixture.escrow.write.acceptProject(
        [projectId],
        { account: fixture.freelancer.account },
      ),
      fixture.escrow,
      "ProjectAccepted",
      [projectId, fixture.freelancer.account.address],
    );

    await viem.assertions.emitWithArgs(
      fixture.escrow.write.submitWork(
        [projectId, "https://example.com/work/1"],
        { account: fixture.freelancer.account },
      ),
      fixture.escrow,
      "WorkSubmitted",
      [projectId, "https://example.com/work/1"],
    );

    const project = await fixture.escrow.read.getProject([projectId]);
    assert.equal(project.status, 3);
    assert.equal(project.proofUrl, "https://example.com/work/1");
  });

  it("pays the freelancer and mints a certificate atomically", async function () {
    const fixture = await deployFixture();
    const projectId = await submitProject(fixture);

    const transactionHash = await fixture.escrow.write.approveWork(
      [projectId],
      { account: fixture.client.account },
    );

    await viem.assertions.emitWithArgs(
      transactionHash,
      fixture.escrow,
      "ProjectCompleted",
      [projectId, fixture.freelancer.account.address, PROJECT_AMOUNT],
    );
    await viem.assertions.emitWithArgs(
      transactionHash,
      fixture.escrow,
      "CertificateMinted",
      [projectId, fixture.freelancer.account.address, projectId],
    );

    const project = await fixture.escrow.read.getProject([projectId]);
    assert.equal(project.status, 4);
    assert.ok(project.completedAt > 0n);
    assert.equal(
      await fixture.token.read.balanceOf([fixture.freelancer.account.address]),
      PROJECT_AMOUNT,
    );
    assert.equal(
      await fixture.token.read.balanceOf([fixture.escrow.address]),
      0n,
    );
    assert.equal(
      getAddress(await fixture.certificate.read.ownerOf([projectId])),
      getAddress(fixture.freelancer.account.address),
    );

    const certificate = await fixture.certificate.read.getCertificate([
      projectId,
    ]);
    assert.equal(certificate.projectId, projectId);
    assert.equal(
      getAddress(certificate.client),
      getAddress(fixture.client.account.address),
    );
    assert.equal(
      getAddress(certificate.freelancer),
      getAddress(fixture.freelancer.account.address),
    );
    assert.equal(certificate.amount, PROJECT_AMOUNT);
    assert.equal(certificate.completedAt, project.completedAt);
  });

  it("returns valid Base64 metadata with the Pinata image URI", async function () {
    const fixture = await deployFixture();
    const projectId = await submitProject(fixture, 'Build "WorkChain" UI');
    await fixture.escrow.write.approveWork(
      [projectId],
      { account: fixture.client.account },
    );

    const tokenURI = await fixture.certificate.read.tokenURI([projectId]);
    const prefix = "data:application/json;base64,";
    assert.ok(tokenURI.startsWith(prefix));

    const metadata = JSON.parse(
      Buffer.from(tokenURI.slice(prefix.length), "base64").toString("utf8"),
    ) as {
      name: string;
      image: string;
      attributes: Array<{ trait_type: string; value: string | number }>;
    };

    assert.equal(metadata.name, 'WorkChain Certificate #1 - Build "WorkChain" UI');
    assert.equal(metadata.image, IMAGE_URI);
    assert.equal(metadata.attributes[0]?.value, "1");
    assert.equal(
      metadata.attributes.find(
        (attribute) => attribute.trait_type === "Amount (wei)",
      )?.value,
      PROJECT_AMOUNT.toString(),
    );
  });

  it("refunds a funded project before acceptance", async function () {
    const fixture = await deployFixture();
    const projectId = await createProject(fixture);
    await fundProject(fixture, projectId);

    await viem.assertions.emitWithArgs(
      fixture.escrow.write.refundProject(
        [projectId],
        { account: fixture.client.account },
      ),
      fixture.escrow,
      "ProjectRefunded",
      [projectId, fixture.client.account.address, PROJECT_AMOUNT],
    );

    assert.equal(
      await fixture.token.read.balanceOf([fixture.client.account.address]),
      PROJECT_AMOUNT,
    );
    assert.equal(
      (await fixture.escrow.read.getProject([projectId])).status,
      5,
    );
  });

  it("cancels an unfunded project", async function () {
    const fixture = await deployFixture();
    const projectId = await createProject(fixture);

    await viem.assertions.emitWithArgs(
      fixture.escrow.write.cancelProject(
        [projectId],
        { account: fixture.client.account },
      ),
      fixture.escrow,
      "ProjectCancelled",
      [projectId, fixture.client.account.address],
    );

    assert.equal(
      (await fixture.escrow.read.getProject([projectId])).status,
      6,
    );
  });

  it("rejects invalid project inputs", async function () {
    const fixture = await deployFixture();
    const { client, freelancer, escrow } = fixture;

    await viem.assertions.revertWithCustomError(
      escrow.write.createProject(
        [
          "",
          "Description",
          freelancer.account.address,
          PROJECT_AMOUNT,
        ],
        { account: client.account },
      ),
      escrow,
      "EmptyTitle",
    );
    await viem.assertions.revertWithCustomError(
      escrow.write.createProject(
        ["Title", "", freelancer.account.address, PROJECT_AMOUNT],
        { account: client.account },
      ),
      escrow,
      "EmptyDescription",
    );
    await viem.assertions.revertWithCustomError(
      escrow.write.createProject(
        ["Title", "Description", zeroAddress, PROJECT_AMOUNT],
        { account: client.account },
      ),
      escrow,
      "InvalidAddress",
    );
    await viem.assertions.revertWithCustomError(
      escrow.write.createProject(
        ["Title", "Description", freelancer.account.address, 0n],
        { account: client.account },
      ),
      escrow,
      "InvalidAmount",
    );
  });

  it("rejects unauthorized actions and invalid states", async function () {
    const fixture = await deployFixture();
    const projectId = await createProject(fixture);

    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.fundProject(
        [projectId],
        { account: fixture.outsider.account },
      ),
      fixture.escrow,
      "OnlyClient",
    );

    await fundProject(fixture, projectId);

    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.acceptProject(
        [projectId],
        { account: fixture.outsider.account },
      ),
      fixture.escrow,
      "OnlyFreelancer",
    );

    await fixture.escrow.write.acceptProject(
      [projectId],
      { account: fixture.freelancer.account },
    );

    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.refundProject(
        [projectId],
        { account: fixture.client.account },
      ),
      fixture.escrow,
      "InvalidStatus",
    );
    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.submitWork(
        [projectId, ""],
        { account: fixture.freelancer.account },
      ),
      fixture.escrow,
      "EmptyProofUrl",
    );
    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.submitWork(
        [projectId, "https://example.com/work"],
        { account: fixture.outsider.account },
      ),
      fixture.escrow,
      "OnlyFreelancer",
    );

    await fixture.escrow.write.submitWork(
      [projectId, "https://example.com/work"],
      { account: fixture.freelancer.account },
    );

    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.approveWork(
        [projectId],
        { account: fixture.outsider.account },
      ),
      fixture.escrow,
      "OnlyClient",
    );

    await fixture.escrow.write.approveWork(
      [projectId],
      { account: fixture.client.account },
    );
    await viem.assertions.revertWithCustomError(
      fixture.escrow.write.approveWork(
        [projectId],
        { account: fixture.client.account },
      ),
      fixture.escrow,
      "InvalidStatus",
    );
  });

  it("requires allowance before funding and only lets escrow mint", async function () {
    const fixture = await deployFixture();
    const projectId = await createProject(fixture);

    await fixture.token.write.transfer(
      [fixture.client.account.address, PROJECT_AMOUNT],
      { account: fixture.deployer.account },
    );

    await assert.rejects(
      fixture.escrow.write.fundProject(
        [projectId],
        { account: fixture.client.account },
      ),
      /ERC20InsufficientAllowance/,
    );

    await viem.assertions.revertWithCustomError(
      fixture.certificate.write.mintCertificate(
        [
          fixture.freelancer.account.address,
          projectId,
          "Fake certificate",
          fixture.client.account.address,
          PROJECT_AMOUNT,
          1n,
        ],
        { account: fixture.outsider.account },
      ),
      fixture.certificate,
      "OnlyEscrow",
    );
  });

  it("rejects reads for projects that do not exist", async function () {
    const fixture = await deployFixture();

    await viem.assertions.revertWithCustomError(
      fixture.escrow.read.getProject([999n]),
      fixture.escrow,
      "ProjectNotFound",
    );
  });

  it("uses the configured immutable contract relationships", async function () {
    const fixture = await deployFixture();

    assert.equal(
      getAddress(await fixture.escrow.read.paymentToken()),
      getAddress(fixture.token.address),
    );
    assert.equal(
      getAddress(await fixture.escrow.read.certificateNFT()),
      getAddress(fixture.certificate.address),
    );
    assert.equal(
      getAddress(await fixture.certificate.read.escrow()),
      getAddress(fixture.escrow.address),
    );
    assert.equal(await fixture.certificate.read.imageURI(), IMAGE_URI);

    const latestBlock = await publicClient.getBlock();
    assert.ok(latestBlock.number >= 0n);
  });
});
