
const Token = artifacts.require("Token");
const Frxchange = artifacts.require("Frxchange");

module.exports = async function(deployer) {
  //deploy token
  await deployer.deploy(Token);
  const token = await Token.deployed()

  //deploy exchange
  await deployer.deploy(Frxchange, token.address);
  const frxchange = await Frxchange.deployed()

  //transfer to exchange
  await token.transfer(frxchange.address, '1000000000000000000000000')

};