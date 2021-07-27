const { assert } = require('chai')
const chaiAsPromised = require('chai-as-promised')

const Token = artifacts.require('Token')
const Frxchange = artifacts.require('Frxchange')

require('chai')
    .use(require('chai-as-promised'))
    .should()

//converts numbers from Wei to human-readable
function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}


contract(Frxchange,([deployer, investor]) => {
    let token, frxchange

    before(async () => {
        token = await Token.new()
        frxchange = await Frxchange.new(token.address)
        await token.transfer(frxchange.address, tokens('1000000'))
    })

    describe('Token deployment', async () => {
        it('Token name test', async () => {            
            const tkn_name = await token.name()
            assert.equal(tkn_name, 'FRX Token')
        })

        it('Token symbol test', async () => {            
            const tkn_sym = await token.symbol()
            assert.equal(tkn_sym, 'FRXT')
        })
    })

    describe('Frxchange deployment', async () => {
        it('Contract name test', async () => {
            const excg_name = await frxchange.name()
            assert.equal(excg_name, 'Frxchange')
        })

        it('FRXT tokens on exchange', async () => {
            assert.equal( await token.balanceOf(frxchange.address), tokens('1000000'))
        })
    })

    describe('Token functionality', async () => {
        let result 

        before(async () =>{
            result = await frxchange.buyTokens({
                from: investor,
                value: web3.utils.toWei('1', 'ether')
            })
        })

        it('FRXT purchase from frxchange test', async () => {
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance, tokens('100'))

            let excg_token_balance = await token.balanceOf(frxchange.address)
            assert.equal(excg_token_balance, tokens('999900'))

            let excg_eth_balance = await web3.eth.getBalance(frxchange.address)
            assert.equal(excg_eth_balance, web3.utils.toWei('1', 'ether'))

            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })



})
    