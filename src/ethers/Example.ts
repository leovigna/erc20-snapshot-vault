import { ContractFactory } from 'ethers';
import { abi, bytecode } from '../abi/Example.json';

export default new ContractFactory(abi, bytecode);
