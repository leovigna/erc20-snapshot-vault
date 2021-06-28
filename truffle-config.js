module.exports = {
    contracts_directory: './src/solidity', // eslint-disable-line @typescript-eslint/camelcase
    contracts_build_directory: './src/abi', // eslint-disable-line @typescript-eslint/camelcase
    compilers: {
        solc: {
            version: '0.6.12', // Fetch exact version from solc-bin (default: truffle's version)
            settings: {
                // See the solidity docs for advice about optimization and evmVersion
                parser: 'solcjs',
                optimizer: {
                    enabled: true,
                    runs: 200,
                },
                evmVersion: 'istanbul', //chainId()
            },
        },
    },
};
