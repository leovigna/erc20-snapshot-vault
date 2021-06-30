import { SnapshotVaultContract as ContractInterface } from '../types/truffle/SnapshotVault';
import Artifact from '../abi/SnapshotVault.json';

const Contract = require('@truffle/contract');
export default Contract(Artifact) as ContractInterface;
