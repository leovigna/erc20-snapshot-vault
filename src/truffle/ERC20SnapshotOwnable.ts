import { ERC20SnapshotOwnableContract as ContractInterface } from '../types/truffle/ERC20SnapshotOwnable';
import Artifact from '../abi/ERC20SnapshotOwnable.json';

const Contract = require('@truffle/contract');
export default Contract(Artifact) as ContractInterface;
