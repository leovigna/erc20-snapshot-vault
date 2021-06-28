import Example from '../truffle/Example';

export const contracts = {
    Example: Example,
};
export type ContractName = keyof typeof contracts;

//patch mock artifacts object for backwards-compatibility
export const artifacts = {
    require(name: ContractName) {
        return contracts[name];
    },
};
