import { ContractFactory } from 'ethers';
import { abi, bytecode } from '../abi/SnapshotVault.json';

export default new ContractFactory(abi, bytecode);
