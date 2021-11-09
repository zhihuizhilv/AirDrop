// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ethers = hre.ethers;
const deployResult = require('./deploy_result');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  await deployResult.load();

  // We get the contract to deploy
  const Disperse = await ethers.getContractFactory("Disperse");
  const disperse = await Disperse.deploy();
  await disperse.deployed();

  deployResult.writeAbi("Disperse", Disperse);
  deployResult.writeDeployedContract(
      "disperse",
      disperse.address,
      "Disperse",
      {}
      );

  console.log("disperse address:", disperse.address);
  await deployResult.save();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
