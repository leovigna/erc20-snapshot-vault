import { ERC20InflationProtectedContract as ContractInterface } from '../types/truffle/ERC20InflationProtected';
import Artifact from '../abi/ERC20InflationProtected.json';

const Contract = require('@truffle/contract');
export default Contract(Artifact) as ContractInterface;
