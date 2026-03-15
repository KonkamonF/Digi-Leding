const hre = require("hardhat");

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Seeding with account:", deployer.address);

  const lendingAddress = "PASTE_DEPLOYED_CONTRACT_ADDRESS";

  const lending = await hre.ethers.getContractAt(
    "DigiLending",
    lendingAddress
  );

  const tx = await lending.deposit({
    value: hre.ethers.parseEther("1")
  });

  await tx.wait();

  console.log("Seed completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});