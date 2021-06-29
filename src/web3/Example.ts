import Web3 from 'web3';
import { Example as ContractInterface } from '../types/web3/Example';
import { abi, bytecode } from '../abi/Example.json';

const ContractFactory = (web3: Web3) =>
    new web3.eth.Contract(abi as any, undefined, {
        data: bytecode,
        from: web3.eth.defaultAccount ?? undefined,
    }) as unknown as ContractInterface;
export default ContractFactory;
