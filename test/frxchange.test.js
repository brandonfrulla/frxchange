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

    describe('Token buy functionality', async () => {
        let result 

        before(async () =>{
            result = await frxchange.buyTokens({
                from: investor,
                value: web3.utils.toWei('1', 'ether')
            })
        })

        it('FRXT purchase from frxchange test', async () => {
            //verify investor recieved tokens
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance, tokens('100'))

            //verify exchange token balance decrements
            let excg_token_balance = await token.balanceOf(frxchange.address)
            assert.equal(excg_token_balance, tokens('999900'))

            //verify exchange eth balance increments
            let excg_eth_balance = await web3.eth.getBalance(frxchange.address)
            assert.equal(excg_eth_balance, web3.utils.toWei('1', 'ether'))

            //test logs to verify 
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('Token sell functionality', async () => {
        let result 

        before(async () =>{
            await token.approve(frxchange.address, tokens('100'), {from: investor})

            result = await frxchange.sellTokens(tokens('100'), {from: investor})
        })

        it('FRXT sell to exchange test', async () => {
            //verify investor balance went down by n* rate - 1-> n in this test
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance, tokens('0'))

            //verify echange got n tokens back
            let excg_token_balance = await token.balanceOf(frxchange.address)
            assert.equal(excg_token_balance, tokens('1000000'))

            //verify echange eth -1 eth
            let excg_eth_balance = await web3.eth.getBalance(frxchange.address)
            assert.equal(excg_eth_balance, web3.utils.toWei('0', 'ether'))

            //test logs to verify 
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //FAIL; selling more tokens than in wallet
            await frxchange.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
        })
    })

})
    