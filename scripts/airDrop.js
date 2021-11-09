// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ethers = hre.ethers;
const BigNumber = ethers.BigNumber;
const deployResult = require('./deploy_result');
const fs = require("fs");
const airDropFile = "./airDrop.json";

let airDropData = {};

async function loadAirDropData() {
  airDropData = JSON.parse(fs.readFileSync(airDropFile));
}

async function getDMT() {
  return await ethers.getContractAt("IERC20", deployResult.getData().deployedContract.dmt.address);
}

async function getDisperse() {
  return await ethers.getContractAt(deployResult.getData().deployedContract.disperse.contractName, deployResult.getData().deployedContract.disperse.address);
}

async function getAccountInfo(account) {
  console.log("network:", hre.network.name);
  console.log("account:", account.address)
  console.log("account balance:", ethers.utils.formatEther((await account.getBalance())));

  let dmt = await getDMT();
  console.log(account.address, "DMT balance:", ethers.utils.formatEther(await dmt.balanceOf(account.address)));
}

async function airDrop(account) {
  let dmt = await getDMT();
  let disperse = await getDisperse();
  await (await dmt.approve(disperse.address, ethers.utils.parseEther("1000000"))).wait();
  for (let i = 0; i < airDropData.length;) {
    let count = 10;
    if (count > airDropData.length - i) {
      count = airDropData.length - i;
    }

    let recipients = [];
    let values = [];
    for (let j = 0; j < count; j++) {
      let data = airDropData[i+j];
      recipients.push(data.user);
      values.push(ethers.utils.parseEther(data.airDropValue));
    }

    console.log("begin disparse dmt. from", i, ", count:", count);
    console.log(recipients);
    console.log(values);
    await (await disperse.disperseToken(dmt.address, recipients, values)).wait();
    console.log("operator dmt balance:", ethers.utils.formatEther(await dmt.balanceOf(account.address)));
    for (let j = 0; j < count; j++) {
      console.log(recipients[j], "dmt balance:", ethers.utils.formatEther(await dmt.balanceOf(recipients[j])));
    }

    i += count;
  }
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [account] = await ethers.getSigners();

  await deployResult.load();

  await getAccountInfo(account);

  await loadAirDropData();

  await airDrop(account);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
