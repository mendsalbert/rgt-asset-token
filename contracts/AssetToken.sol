// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AssetToken {
    string public name = "AssetToken";
    string public symbol = "AST";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public rewardRate = 0.1 * 10**18; // 0.1 token per asset
    uint256 public rewardPool = 10000 * 10**18; // 10,000 tokens for rewards

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    struct Asset {
        uint256 amount;
        uint256 lastClaimed;
    }

    mapping(address => Asset) public assets;
    mapping(address => uint256) public rewards;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AssetCreated(address indexed owner, uint256 amount);
    event RewardClaimed(address indexed owner, uint256 amount);

    constructor() {
        totalSupply = rewardPool;
        balanceOf[address(this)] = rewardPool;
        emit Transfer(address(0), address(this), rewardPool);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Allowance exceeded");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function deposit(uint256 amount) public {
        require(amount % 10 == 0, "Deposit must be a multiple of 10");
        transfer(address(this), amount);

        uint256 assetCount = amount / 10;
        assets[msg.sender].amount += assetCount;
        assets[msg.sender].lastClaimed = block.timestamp;

        emit AssetCreated(msg.sender, assetCount);
    }

    function calculateReward(address owner) public view returns (uint256) {
        Asset memory asset = assets[owner];
        uint256 timeElapsed = block.timestamp - asset.lastClaimed;
        uint256 reward = (timeElapsed / 1 days) * rewardRate * asset.amount;
        return reward;
    }

    function claimReward() public {
        uint256 reward = calculateReward(msg.sender);
        require(reward <= rewardPool, "Not enough rewards in pool");

        assets[msg.sender].lastClaimed = block.timestamp;
        rewards[msg.sender] += reward;
        rewardPool -= reward;

        balanceOf[address(this)] -= reward;
        balanceOf[msg.sender] += reward;

        emit Transfer(address(this), msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }
}
