import { ExampleContract as ContractInterface } from '../types/truffle/Example';
import Artifact from '../abi/Example.json';

const Contract = require('@truffle/contract');
export default Contract(Artifact) as ContractInterface;
