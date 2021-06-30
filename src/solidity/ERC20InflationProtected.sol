// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './ISnapshotVault.sol';

/**
 * @dev An ERC20Mintable token that hedges inflation by issuing a
 * fixed proportion to a claimant. Combined with SnapshotVault, this
 * can enable the creation of an inflation protected shareholder class.
 * Any address can be a claimant, so ERC20Mintable can work with other
 * distribution mechanisms as well.
 *
 * Whenever tokens are minted by ERC20InflationProtected, X% of
 * tokens are sent to SnapshotVault for dilution protected investors
 * who also hold shares in the SnapshotVault. The SnapshotVault's share
 * in ERC20InflationProtected is constant. Vault shareholders can
 * become agnostic to the minting of new tokens by holding shares in
 * the SnapshotVault proportional to their token holdings.
 *
 */
contract ERC20InflationProtected is ERC20, Ownable {
    address claimantAddress;
    uint256 claimantShareNumerator;
    uint256 claimantShareDivisor;

    constructor(
        string memory name,
        string memory symbol,
        address _claimantAddress,
        uint256 _claimantShareNumerator,
        uint256 _claimantShareDivisor
    ) ERC20(name, symbol) {
        claimantAddress = _claimantAddress;
        claimantShareNumerator = _claimantShareNumerator;
        claimantShareDivisor = _claimantShareDivisor;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        uint256 inflationProtectionAmount = (amount * claimantShareNumerator) / claimantShareDivisor;
        _mint(claimantAddress, inflationProtectionAmount); //Mint to inflation protection claimant
    }
}
