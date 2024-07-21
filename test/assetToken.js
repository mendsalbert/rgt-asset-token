const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetToken", function () {
  async function deployAssetTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const AssetToken = await ethers.getContractFactory("AssetToken");
    const assetToken = await AssetToken.deploy();
    await assetToken.deployed();

    return { assetToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right reward pool", async function () {
      const { assetToken } = await deployAssetTokenFixture();
      const rewardPool = await assetToken.rewardPool();
      expect(rewardPool).to.equal(ethers.utils.parseEther("10000"));
    });
  });

  describe("Deposit", function () {
    it("Should allow deposits in multiples of 10", async function () {
      const { assetToken, owner } = await deployAssetTokenFixture();
      const depositAmount = ethers.utils.parseEther("20");

      await assetToken.transfer(owner.address, depositAmount);
      await assetToken.deposit(depositAmount);

      const asset = await assetToken.assets(owner.address);
      expect(asset.amount).to.equal(2);
    });

    it("Should revert if deposit is not in multiples of 10", async function () {
      const { assetToken, owner } = await deployAssetTokenFixture();
      const depositAmount = ethers.utils.parseEther("15");

      await assetToken.transfer(owner.address, depositAmount);
      await expect(assetToken.deposit(depositAmount)).to.be.revertedWith(
        "Deposit must be a multiple of 10"
      );
    });
  });

  describe("Rewards", function () {
    it("Should calculate the correct rewards", async function () {
      const { assetToken, owner } = await deployAssetTokenFixture();
      const depositAmount = ethers.utils.parseEther("40");

      await assetToken.transfer(owner.address, depositAmount);
      await assetToken.deposit(depositAmount);

      const asset = await assetToken.assets(owner.address);
      const reward = await assetToken.calculateReward(owner.address);
      expect(reward).to.equal(ethers.utils.parseEther("0.4"));
    });

    it("Should allow claiming rewards", async function () {
      const { assetToken, owner } = await deployAssetTokenFixture();
      const depositAmount = ethers.utils.parseEther("40");

      await assetToken.transfer(owner.address, depositAmount);
      await assetToken.deposit(depositAmount);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await assetToken.claimReward();

      const rewardBalance = await assetToken.balanceOf(owner.address);
      expect(rewardBalance).to.equal(ethers.utils.parseEther("0.4"));
    });

    it("Should revert if there are not enough rewards in the pool", async function () {
      const { assetToken, owner } = await deployAssetTokenFixture();
      const depositAmount = ethers.utils.parseEther("100000");

      await assetToken.transfer(owner.address, depositAmount);
      await assetToken.deposit(depositAmount);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      await expect(assetToken.claimReward()).to.be.revertedWith(
        "Not enough rewards in pool"
      );
    });
  });
});
