import { assert } from 'chai';
import ERC20InflationProtected from '../../truffle/ERC20InflationProtected';

import { configure } from '../configure';

describe('SnapshotVault', function () {
	let web3: Web3;
	let accounts: string[];

	before(async () => {
		const config = await configure();
		web3 = config.ganache.web3;
		accounts = config.accounts;
	});

	it('10% Inflation protected, claimant simple address', async () => {
		const cashflowToken = await ERC20InflationProtected.new('ABC Coin', 'ABC', accounts[1], 10, 100);
		await cashflowToken.mint(accounts[0], 10000); //accounts[1] receives additional 10%
		assert.equal((await cashflowToken.totalSupply()).toNumber(), 11000, 'totalSupply did not increase by 110% of requested')
		assert.equal((await cashflowToken.balanceOf(accounts[1])).toNumber(), 1000, 'claimant did not receive 10% of minted')
	});
});
