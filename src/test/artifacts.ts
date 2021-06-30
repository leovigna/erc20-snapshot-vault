import ERC20MintableOwnable from '../truffle/ERC20MintableOwnable';
import ERC20SnapshotOwnable from '../truffle/ERC20SnapshotOwnable';
import ERC20InflationProtected from '../truffle/ERC20InflationProtected';
import SnapshotVault from '../truffle/SnapshotVault';

export const contracts = {
	ERC20MintableOwnable,
	ERC20SnapshotOwnable,
	ERC20InflationProtected,
	SnapshotVault
};
export type ContractName = keyof typeof contracts;

//patch mock artifacts object for backwards-compatibility
export const artifacts = {
	require(name: ContractName) {
		return contracts[name];
	},
};
