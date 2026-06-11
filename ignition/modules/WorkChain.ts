import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_SUPPLY = 1_000_000n * 10n ** 18n;

export default buildModule("WorkChainModule", (module) => {
  const certificateImageURI = module.getParameter(
    "certificateImageURI",
    process.env.CERTIFICATE_IMAGE_URI ?? "ipfs://replace-with-pinata-cid",
  );

  const token = module.contract("WorkChainToken", [INITIAL_SUPPLY]);
  const certificate = module.contract("WorkCertificateNFT", [
    certificateImageURI,
  ]);
  const escrow = module.contract("WorkChainEscrow", [token, certificate]);

  const setEscrow = module.call(certificate, "setEscrow", [escrow]);
  module.call(certificate, "renounceOwnership", [], {
    after: [setEscrow],
  });

  return { token, certificate, escrow };
});
