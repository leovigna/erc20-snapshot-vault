import { assert } from 'chai';
import truffleAssert from 'truffle-assertions';


import ERC20MintableOwnable from '../../truffle/ERC20MintableOwnable';
import ERC20SnapshotOwnable from '../../truffle/ERC20SnapshotOwnable';
import SnapshotVault from '../../truffle/SnapshotVault';

import { configure } from '../configure';

describe('SnapshotVault', function () {
	let web3: Web3;
	let accounts: string[];

	before(async () => {
		const config = await configure();
		web3 = config.ganache.web3;
		accounts = config.accounts;
	});

	it('Error: amount > withdrawable', async () => {
		const cashflowToken = await ERC20MintableOwnable.new('USD Coin', 'USDC');
		await cashflowToken.mint(accounts[0], 1000); //1000 USD
		const shareholderToken = await ERC20SnapshotOwnable.new('XYZ Fund', 'XYZ', 100); //accounts[0] owns 100%

		const vault = await SnapshotVault.new(shareholderToken.address);
		await shareholderToken.transferOwnership(vault.address); //Transfer snapshot rights to vault
		await cashflowToken.transfer(vault.address, 1000); //Vault permitted to draw 1000 USD
		await vault.snapshot(cashflowToken.address, 1000); //Create new snapshot

		await truffleAssert.reverts(vault.withdraw(1, 1001), 'amount > withdrawable');
	})

	it('Error: amount > nextSnapshotCashflow', async () => {
		const cashflowToken = await ERC20MintableOwnable.new('USD Coin', 'USDC');
		await cashflowToken.mint(accounts[0], 2000); //1000 USD
		const shareholderToken = await ERC20SnapshotOwnable.new('XYZ Fund', 'XYZ', 100); //accounts[0] owns 100%

		const vault = await SnapshotVault.new(shareholderToken.address);
		await shareholderToken.transferOwnership(vault.address); //Transfer snapshot rights to vault
		await cashflowToken.transfer(vault.address, 1000); //Transfer 1000 USD to Vault

		await vault.snapshot(cashflowToken.address, 1000); //Create new snapshot
		await truffleAssert.reverts(vault.snapshot(cashflowToken.address, 1000), 'amount > nextSnapshotCashflow'); //Reverts as balance insufficient

		await vault.withdraw(1, 300); //Test accounting

		await cashflowToken.transfer(vault.address, 1000); //Transfer 1000 USD to Vault
		vault.snapshot(cashflowToken.address, 1000); //Works as balance is sufficient

		await vault.withdraw(1, 700); //Test accounting
		await vault.withdraw(2, 1000); //Test accounting
	})

	it('Vault 100% owned', async () => {
		const cashflowToken = await ERC20MintableOwnable.new('USD Coin', 'USDC');
		await cashflowToken.mint(accounts[0], 1000); //1000 USD
		const shareholderToken = await ERC20SnapshotOwnable.new('XYZ Fund', 'XYZ', 100); //accounts[0] owns 100%

		const vault = await SnapshotVault.new(shareholderToken.address);
		await shareholderToken.transferOwnership(vault.address); //Transfer snapshot rights to vault
		assert.equal(await shareholderToken.owner(), vault.address, 'Snapshot permissions not set to vault')
		await cashflowToken.transfer(vault.address, 1000); //Transfer 1000 USD to Vault
		await vault.snapshot(cashflowToken.address, 1000); //Create new snapshot

		//0 withdrawn
		assert.equal((await cashflowToken.balanceOf(vault.address)).toNumber(), 1000, 'vault balance not updated');
		assert.equal((await cashflowToken.balanceOf(accounts[0])).toNumber(), 0, 'accounts[0] balance not updated');

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 1000, 'withdrawableOfAt() incorrect'); //accounts[0] owns 100%
		assert.equal((await vault.withdrawnOfAt(accounts[0], 1)).toNumber(), 0, 'withdrawnOfAt() incorrect'); //accounts[0] has withdrawn 0

		//300 withdrawn
		await vault.withdraw(1, 300);

		assert.equal((await cashflowToken.balanceOf(vault.address)).toNumber(), 700, 'vault balance not updated');
		assert.equal((await cashflowToken.balanceOf(accounts[0])).toNumber(), 300, 'accounts[0] balance not updated');

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 700, 'withdrawableOfAt() incorrect'); //700 left to withdraw
		assert.equal((await vault.withdrawnOfAt(accounts[0], 1)).toNumber(), 300, 'withdrawnOfAt() incorrect'); //accounts[0] has withdrawn 300

		//700 withdrawn
		await vault.withdraw(1, 700);

		assert.equal((await cashflowToken.balanceOf(vault.address)).toNumber(), 0, 'vault balance not updated');
		assert.equal((await cashflowToken.balanceOf(accounts[0])).toNumber(), 1000, 'accounts[0] balance not updated');

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 0, 'withdrawableOfAt() incorrect'); //0 left to withdraw
		assert.equal((await vault.withdrawnOfAt(accounts[0], 1)).toNumber(), 1000, 'withdrawnOfAt() incorrect'); //accounts[0] has withdrawn 1000
	});

	it('Transfer shares post-snapshot', async () => {
		//Same as previous test, transferring shares post-snapshot has no effect
		const cashflowToken = await ERC20MintableOwnable.new('USD Coin', 'USDC');
		await cashflowToken.mint(accounts[0], 1000); //1000 USD
		const shareholderToken = await ERC20SnapshotOwnable.new('XYZ Fund', 'XYZ', 100); //accounts[0] owns 100%

		const vault = await SnapshotVault.new(shareholderToken.address);
		await shareholderToken.transferOwnership(vault.address); //Transfer snapshot rights to vault
		await cashflowToken.transfer(vault.address, 1000); //Transfer 1000 USD to Vault
		await vault.snapshot(cashflowToken.address, 1000); //Create new snapshot
		await shareholderToken.transfer(accounts[1], 20); //accounts[0] owns 80% post-snapshot

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 1000, 'withdrawableOfAt() incorrect'); //accounts[0] owned 100% at snapshot time
		assert.equal((await vault.withdrawableOfAt(accounts[1], 1)).toNumber(), 0, 'withdrawableOfAt() incorrect'); //accounts[1] owned 0% at snapshot time

		await vault.withdraw(1, 1000);

		assert.equal((await cashflowToken.balanceOf(vault.address)).toNumber(), 0, 'vault balance not updated');
		assert.equal((await cashflowToken.balanceOf(accounts[0])).toNumber(), 1000, 'accounts[0] balance not updated');

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 0, 'withdrawableOfAt() incorrect'); //0 left to withdraw
		assert.equal((await vault.withdrawnOfAt(accounts[0], 1)).toNumber(), 1000, 'withdrawnOfAt() incorrect'); //accounts[0] has withdrawn 1000
	})

	it('Transfer shares pre-snapshot', async () => {
		//Transferring shares pre-snapshot changes distribution of funds
		const cashflowToken = await ERC20MintableOwnable.new('USD Coin', 'USDC');
		await cashflowToken.mint(accounts[0], 1000); //1000 USD
		const shareholderToken = await ERC20SnapshotOwnable.new('XYZ Fund', 'XYZ', 100); //accounts[0] owns 100%

		const vault = await SnapshotVault.new(shareholderToken.address);
		await shareholderToken.transferOwnership(vault.address); //Transfer snapshot rights to vault
		await cashflowToken.transfer(vault.address, 1000); //Transfer 1000 USD to Vault
		await shareholderToken.transfer(accounts[1], 20); //accounts[0] owns 80% pre-snapshot
		await vault.snapshot(cashflowToken.address, 1000); //Create new snapshot

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 800, 'withdrawableOfAt() incorrect'); //accounts[0] owned 80% at snapshot time
		assert.equal((await vault.withdrawableOfAt(accounts[1], 1)).toNumber(), 200, 'withdrawableOfAt() incorrect'); //accounts[1] owned 20% at snapshot time

		await vault.withdraw(1, 800);

		assert.equal((await cashflowToken.balanceOf(vault.address)).toNumber(), 200, 'vault balance not updated');
		assert.equal((await cashflowToken.balanceOf(accounts[0])).toNumber(), 800, 'accounts[0] balance not updated');

		assert.equal((await vault.withdrawableOfAt(accounts[0], 1)).toNumber(), 0, 'withdrawableOfAt() incorrect'); //0 left to withdraw
		assert.equal((await vault.withdrawnOfAt(accounts[0], 1)).toNumber(), 800, 'withdrawnOfAt() incorrect'); //accounts[0] has withdrawn 800

		await vault.withdraw(1, 200, { from: accounts[1] });

		assert.equal((await cashflowToken.balanceOf(vault.address)).toNumber(), 0, 'vault balance not updated');
		assert.equal((await cashflowToken.balanceOf(accounts[1])).toNumber(), 200, 'accounts[1] balance not updated');

		assert.equal((await vault.withdrawableOfAt(accounts[1], 1)).toNumber(), 0, 'withdrawableOfAt() incorrect'); //0 left to withdraw
		assert.equal((await vault.withdrawnOfAt(accounts[1], 1)).toNumber(), 200, 'withdrawnOfAt() incorrect'); //accounts[1] has withdrawn 200
	})

});
