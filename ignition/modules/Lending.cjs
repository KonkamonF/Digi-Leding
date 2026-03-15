const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LendingModule", (m) => {

  const lending = m.contract("DigiLending", []);

  return { lending };

});