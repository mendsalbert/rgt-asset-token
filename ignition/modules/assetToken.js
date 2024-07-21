const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AssetToken", (m) => {
  const assetToken = m.contract("AssetToken");
  return { assetToken };
});
