// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

import './ISnapshotVault.sol';
import './IERC20Snapshot.sol';

/**
 * @dev A vault used to store and distribute cashflow tokens to shareholder token holders.
 *
 * The SnapshotVault is defined by its `shareholderToken` parameter which MUST be a token
 * implementing the ERC20Snapshot extension. The token can have a variable supply since
 * snapshots also store the total supply. The SnapshotVault `owner` address is responsible
 * for triggerring snapshots: this can be delegated to a governance contract or a fixed
 * periodical trigger.
 *
 * For greater flexibility, the SnapshotVault is designed to be able to distribute any
 * ERC20 token. The `snapshot()` function then transfers the tokens from the approval
 * address and takes a snapshot of the shareholders.
 * To allow simplified transfers to the Vault, instead of using `transferFrom` function,
 * the vault uses it's own token balance while keeping track of past snapshot distributions.
 * This let's us simply deposit funds into the vault (single or multiple transfers) with
 * the possibility to then distribute these to shareholders when a snapshot occurs.
 */
contract SnapshotVault is AccessControl, ISnapshotVault {
    bytes32 public constant SNAPSHOT_ROLE = keccak256('SNAPSHOT_ROLE');

    address public sharesholderTokenAddress;

    mapping(address => mapping(uint256 => uint256)) internal _accountSnapshotWithdrawn;
    mapping(uint256 => address) internal _snapshotToken;
    mapping(uint256 => uint256) internal _snapshotAmount;

    mapping(address => uint256) internal _cashflowTotalDistributable; //Track cumulative sum of cashflows to distribute
    mapping(address => uint256) internal _cashflowTotalDistributed; //Track cumulative sum of cashflows that have been distributed

    constructor(address _shareholderTokenAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SNAPSHOT_ROLE, msg.sender);

        sharesholderTokenAddress = _shareholderTokenAddress;
    }

    /**
     * @dev Get current balance that can be distributed, accounting for previous snapshot to be distributed
     * @param cashflowTokenAddress Cashflow token distributed to shareholders for the snapshot (eg. USDC)
     * @return maximum amount that can be distributed in next snapshot
     */
    function nextSnapshotCashflowAmount(address cashflowTokenAddress) public view returns (uint256) {
        uint256 balance = IERC20(cashflowTokenAddress).balanceOf(address(this));
        uint256 cashflowDistributable = _cashflowTotalDistributable[cashflowTokenAddress];
        uint256 cashflowDistributed = _cashflowTotalDistributed[cashflowTokenAddress];

        return balance - cashflowDistributable + cashflowDistributed;
    }

    /**
     * @notice Vault snapshot `cashflowTokenAddress` transfer `amount` from `from`
     * @dev Creates a new snapshot and accounts for balance to be distributed.
     * @param cashflowTokenAddress Cashflow token distributed to shareholders for the snapshot (eg. USDC)
     * @param amount amount of cashflow tokens to transfer
     */
    function snapshot(address cashflowTokenAddress, uint256 amount) external override {
        require(hasRole(SNAPSHOT_ROLE, msg.sender));
        require(amount <= nextSnapshotCashflowAmount(cashflowTokenAddress), 'amount > nextSnapshotCashflow');

        uint256 currentSnapshotId = IERC20Snapshot(sharesholderTokenAddress).snapshot();
        _snapshotToken[currentSnapshotId] = cashflowTokenAddress;
        _snapshotAmount[currentSnapshotId] = amount;

        _cashflowTotalDistributable[cashflowTokenAddress] += amount;
    }

    function snapshotTokenAt(uint256 snapshotId) public view override returns (address) {
        return _snapshotToken[snapshotId];
    }

    function snapshotAmountAt(uint256 snapshotId) public view override returns (uint256) {
        return _snapshotAmount[snapshotId];
    }

    function withdrawnOfAt(address from, uint256 snapshotId) public view override returns (uint256) {
        return _accountSnapshotWithdrawn[from][snapshotId];
    }

    function withdrawableOfAt(address from, uint256 snapshotId) public view override returns (uint256) {
        uint256 balance = ERC20Snapshot(sharesholderTokenAddress).balanceOfAt(from, snapshotId);
        uint256 totalSupply = ERC20Snapshot(sharesholderTokenAddress).totalSupplyAt(snapshotId);

        uint256 snapshotAmount = snapshotAmountAt(snapshotId);
        uint256 withdrawn = withdrawnOfAt(from, snapshotId);

        uint256 withdrawable = ((snapshotAmount * balance) / totalSupply) - withdrawn;

        return withdrawable;
    }

    function withdraw(uint256 snapshotId, uint256 amount) external override {
        address from = msg.sender;
        uint256 withdrawable = withdrawableOfAt(from, snapshotId);

        require(amount <= withdrawable, 'Error: amount > withdrawable');

        address cashflowTokenAddress = _snapshotToken[snapshotId];
        _accountSnapshotWithdrawn[from][snapshotId] += amount;
        _cashflowTotalDistributed[cashflowTokenAddress] += amount;

        //Transfer cashflow token
        IERC20 cashflowToken = IERC20(cashflowTokenAddress);
        cashflowToken.transfer(from, amount);
    }
}
