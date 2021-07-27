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
        })
    })



})
    