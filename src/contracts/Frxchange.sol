pragma solidity ^0.5.0;

import "./Token.sol";

contract Frxchange {

    string public name = "Frxchange";
    Token public token;
    uint public rate = 100;
    
    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        uint tokenAmount = msg.value * rate;
        token.transfer(msg.sender, tokenAmount);
    }
}