import { assert } from 'chai';
import { ethers } from 'ethers';

import ExampleTruffle from '../../truffle/Example';
import ExampleWeb3 from '../../web3/Example';
import ExampleEthers from '../../ethers/Example';
import { configure } from '../configure';

describe('Example', function () {
    let web3: Web3;
    let accounts: string[];

    before(async () => {
        const config = await configure();
        web3 = config.ganache.web3;
        accounts = config.accounts;
    });

    it('sum(): truffle contract', async () => {
        const example = await ExampleTruffle.new();
        assert.equal((await example.sum(1, 2)).toNumber(), 3, '1+2=3');
    });

    it('sum(): web3 contract', async () => {
        //@ts-ignore
        const tx = ExampleWeb3(web3).deploy(); //deploy() has {data} field as non-optional even though it is
        const gas = await tx.estimateGas();
        const example = await tx.send({ from: accounts[0], gas });

        assert.equal(await example.methods.sum(1, 2).call(), 3, '1+2=3');
    });

    it('sum(): ethers contract', async () => {
        const deployed = await ExampleTruffle.new(); //Deploy with Truffle
        //@ts-ignore
        const example = ExampleEthers.attach(deployed.address).connect(new ethers.providers.Web3Provider(web3.currentProvider));

        assert.equal((await example.sum(1, 2)).toNumber(), 3, '1+2=3');
    });
});
