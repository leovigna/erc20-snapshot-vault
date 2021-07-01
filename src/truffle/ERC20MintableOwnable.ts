import { ERC20MintableOwnableContract as ContractInterface } from '../types/truffle/ERC20MintableOwnable';
import Artifact from '../abi/ERC20MintableOwnable.json';

const Contract = require('@truffle/contract');
export default Contract(Artifact) as ContractInterface;
