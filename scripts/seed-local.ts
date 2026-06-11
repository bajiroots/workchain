import { readFile } from "node:fs/promises";

import { network } from "hardhat";
import { parseEther, type Address } from "viem";

const addresses = JSON.parse(
  await readFile(
    new URL(
      "../ignition/deployments/chain-31337/deployed_addresses.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as Record<string, Address>;

const tokenAddress = addresses["WorkChainModule#WorkChainToken"];
const certificateAddress = addresses["WorkChainModule#WorkCertificateNFT"];
const escrowAddress = addresses["WorkChainModule#WorkChainEscrow"];

if (!tokenAddress || !certificateAddress || !escrowAddress) {
  throw new Error("Deploy WorkChain to localhost before seeding.");
}

const { viem } = await network.create("localhost");
const [client, freelancer, secondFreelancer] = await viem.getWalletClients();
const token = await viem.getContractAt("WorkChainToken", tokenAddress);
const escrow = await viem.getContractAt("WorkChainEscrow", escrowAddress);

if ((await escrow.read.projectCount()) > 0n) {
  console.log("Local deployment already contains projects; skipping seed.");
  process.exitCode = 0;
} else {
  const amounts = [
    parseEther("1200"),
    parseEther("450"),
    parseEther("800"),
  ];

  await token.write.approve(
    [escrowAddress, amounts.reduce((total, amount) => total + amount, 0n)],
    { account: client.account },
  );

  await escrow.write.createProject(
    [
      "WorkChain product dashboard",
      "Design and implement the responsive dashboard, project flow, and certificate gallery.",
      freelancer.account.address,
      amounts[0],
    ],
    { account: client.account },
  );
  await escrow.write.fundProject([1n], { account: client.account });
  await escrow.write.acceptProject([1n], { account: freelancer.account });
  await escrow.write.submitWork(
    [1n, "https://github.com/example/workchain-dashboard"],
    { account: freelancer.account },
  );
  await escrow.write.approveWork([1n], { account: client.account });

  await escrow.write.createProject(
    [
      "Smart contract security review",
      "Review escrow state transitions, access controls, and token transfer behavior.",
      secondFreelancer.account.address,
      amounts[1],
    ],
    { account: client.account },
  );
  await escrow.write.fundProject([2n], { account: client.account });

  await escrow.write.createProject(
    [
      "Launch campaign assets",
      "Produce a focused set of launch graphics and social media assets for the MVP.",
      freelancer.account.address,
      amounts[2],
    ],
    { account: client.account },
  );
  await escrow.write.fundProject([3n], { account: client.account });
  await escrow.write.acceptProject([3n], { account: freelancer.account });

  await escrow.write.createProject(
    [
      "Developer documentation",
      "Write deployment and integration documentation for Sepolia.",
      secondFreelancer.account.address,
      parseEther("300"),
    ],
    { account: client.account },
  );

  console.log("Seeded four local WorkChain projects.");
  console.log("Freelancer certificate owner:", freelancer.account.address);
  console.log("Certificate contract:", certificateAddress);
}

