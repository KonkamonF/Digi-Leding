// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


interface IERC20Like {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address a) external view returns (uint256);
}


contract SimpleLending {
    // ======== Parameters (toy model) ========
    // Fixed price: 1 ETH = 2000 TOKEN
    uint256 public constant TOKENS_PER_ETH = 2000e18;


    // Collateral factor: max borrow = 66% of collateral value
    // i.e. borrow <= collateralValue * 66 / 100
    uint256 public constant COLLATERAL_FACTOR_BPS = 6600; // 66.00% in basis points
    uint256 public constant BPS = 10_000;


    // Liquidation threshold: if borrow > collateralValue * 75%, unhealthy
    uint256 public constant LIQ_THRESHOLD_BPS = 7500; // 75.00%


    // Liquidation bonus: liquidator gets 5% extra collateral
    uint256 public constant LIQ_BONUS_BPS = 500; // 5.00%


    IERC20Like public immutable token;


    // ======== Accounting ========
    mapping(address => uint256) public deposits;        // LP deposits (token)
    mapping(address => uint256) public collateralETH;   // borrower collateral (ETH)
    mapping(address => uint256) public debt;            // borrower debt (token)


    uint256 public totalDeposits;
    uint256 public totalDebt;


    // ======== Events ========
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);


    event AddCollateral(address indexed user, uint256 ethAmount);
    event RemoveCollateral(address indexed user, uint256 ethAmount);


    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);


    event Liquidate(address indexed liquidator, address indexed borrower, uint256 repaid, uint256 seizedEth);


    constructor(address token_) {
        require(token_ != address(0), "token=0");
        token = IERC20Like(token_);
    }


    // ======== Helpers ========
    function collateralValueInToken(address user) public view returns (uint256) {
        // ETH collateral valued at fixed rate
        // collateralETH (wei) * TOKENS_PER_ETH / 1e18
        return (collateralETH[user] * TOKENS_PER_ETH) / 1e18;
    }


    function maxBorrowable(address user) public view returns (uint256) {
        return (collateralValueInToken(user) * COLLATERAL_FACTOR_BPS) / BPS;
    }


    function isHealthy(address user) public view returns (bool) {
        uint256 cv = collateralValueInToken(user);
        // Healthy if debt <= cv * LIQ_THRESHOLD
        return debt[user] <= (cv * LIQ_THRESHOLD_BPS) / BPS;
    }


    function availableLiquidity() public view returns (uint256) {
        // Token actually sitting in contract.
        // In a real protocol you'd reconcile with totalDeposits - etc.
        return token.balanceOf(address(this));
    }


    // ======== LP: deposit/withdraw tokens ========
    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");


        deposits[msg.sender] += amount;
        totalDeposits += amount;


        emit Deposit(msg.sender, amount);
    }


    function withdraw(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(deposits[msg.sender] >= amount, "insufficient deposit");


        // Ensure pool keeps enough liquidity to cover outstanding debt
        // (toy rule) availableLiquidity after withdrawal must be >= (totalDebt)
        // In reality: you'd track reserves, utilization, etc.
        uint256 bal = availableLiquidity();
        require(bal >= amount, "pool illiquid");


        // After sending out amount, remaining balance must still cover totalDebt
        require(bal - amount >= totalDebt, "would undercollateralize pool");


        deposits[msg.sender] -= amount;
        totalDeposits -= amount;


        require(token.transfer(msg.sender, amount), "transfer failed");
        emit Withdraw(msg.sender, amount);
    }


    // ======== Borrower: collateral mgmt ========
    function addCollateral() external payable {
        require(msg.value > 0, "eth=0");
        collateralETH[msg.sender] += msg.value;
        emit AddCollateral(msg.sender, msg.value);
    }


    function removeCollateral(uint256 ethAmount) external {
        require(ethAmount > 0, "eth=0");
        require(collateralETH[msg.sender] >= ethAmount, "insufficient collateral");


        // Temporarily reduce collateral and enforce health check
        collateralETH[msg.sender] -= ethAmount;
        require(isHealthy(msg.sender), "would become unhealthy");


        (bool ok, ) = msg.sender.call{value: ethAmount}("");
        require(ok, "eth transfer failed");


        emit RemoveCollateral(msg.sender, ethAmount);
    }


    // ======== Borrow/repay ========
    function borrow(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(collateralETH[msg.sender] > 0, "no collateral");


        uint256 newDebt = debt[msg.sender] + amount;
        require(newDebt <= maxBorrowable(msg.sender), "exceeds max borrow");


        // Must have liquidity
        require(availableLiquidity() >= amount, "insufficient liquidity");


        debt[msg.sender] = newDebt;
        totalDebt += amount;


        require(token.transfer(msg.sender, amount), "transfer failed");
        emit Borrow(msg.sender, amount);
    }


    function repay(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(debt[msg.sender] >= amount, "repay > debt");


        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");


        debt[msg.sender] -= amount;
        totalDebt -= amount;


        emit Repay(msg.sender, amount);
    }


    // ======== Liquidation (toy) ========
    // If borrower unhealthy, liquidator repays some or all debt and receives ETH collateral + bonus.
    function liquidate(address borrower, uint256 repayAmount) external {
        require(borrower != address(0), "borrower=0");
        require(!isHealthy(borrower), "borrower healthy");
        require(repayAmount > 0, "repay=0");
        require(debt[borrower] >= repayAmount, "repay > borrower debt");


        // Liquidator pays tokens to contract
        require(token.transferFrom(msg.sender, address(this), repayAmount), "transferFrom failed");


        // Compute collateral to seize based on fixed price + bonus:
        // repayAmount token => repayAmount / TOKENS_PER_ETH ETH
        uint256 baseSeizeEth = (repayAmount * 1e18) / TOKENS_PER_ETH;
        uint256 bonusEth = (baseSeizeEth * LIQ_BONUS_BPS) / BPS;
        uint256 seizeEth = baseSeizeEth + bonusEth;


        require(collateralETH[borrower] >= seizeEth, "insufficient collateral to seize");


        debt[borrower] -= repayAmount;
        totalDebt -= repayAmount;


        collateralETH[borrower] -= seizeEth;


        (bool ok, ) = msg.sender.call{value: seizeEth}("");
        require(ok, "eth transfer failed");


        emit Liquidate(msg.sender, borrower, repayAmount, seizeEth);
    }


    // Accept ETH
    receive() external payable {}
}
