pragma solidity ^0.5.0;

import "./Token.sol";

contract Frxchange {

    string public name = "Frxchange";
    Token public token;
    uint public rate = 100;
    
    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        //calculate # of tokens to trade for 1 eth
        uint tokenAmount = msg.value * rate;

        //ensure exchange token balance can facilitate trade
        require(token.balanceOf(address(this)) >= tokenAmount);

        //execute trade
        token.transfer(msg.sender, tokenAmount);

        //publish event logs for trade 
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public payable {
        //ensurte msg.sender has enough tokens
        require(token.balanceOf(msg.sender) >= _amount);

        //calculate # of eth to trade for tokens
        uint ethAmount = _amount / rate;

        //ensure exchange eth balance can facilitate trade
        require(ethAmount <= address(this).balance);

        
        //execute trade
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(ethAmount);

        //publish event logs for trade
        emit TokensSold(msg.sender, address(token), _amount, rate);

    }

}