pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract BCCToken is StandardToken{
    string public name = "BlockchainCenterToken";
    string public symbol = "BCCT";
    uint8 public decimal = 0;
    uint public INITIAL_SUPPLY = 10000;
    // How many token units a buyer gets per wei
    uint256 internal rate;
    uint256 internal divider;

    function BCCToken() public{
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        rate = 20000000000000000;
    }

    /**
    * @dev low level token purchase ***DO NOT OVERRIDE***
    * @param _beneficiary Address performing the token purchase
    */
    function buyTokens(address _beneficiary,address _owner,uint256 _amount) public  {

        uint256 weiAmount = _amount;
        require(_beneficiary != address(0));
        require(weiAmount != 0);

        // // calculate token amount to be created
        uint256 tokens = weiAmount.mul(rate).div(divider);

        transferMoney(_owner, tokens, _beneficiary);
        _owner.transfer(weiAmount);
    }

    function transferMoney(address _to, uint256 _value, address _from) public returns(bool){
        require(_to!=address(0));
        require(_value <= balances[_from]);

        //SafeMath.sub will throw error if not enough balance
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(_from,_to,_value);
        return true;
    }
}