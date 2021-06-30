# Solidity Starter Project
A smart contract to proportionally split periodical cashflows to a set of ERC20 holders.

## Intro
SnapshotVault aims to offer a better solution to distribute periodical cashflows proportionally to token holders without the need to lock tokens. Let's take the example of a decentralized fund called XYZ looking to distribute USDC profits to its token holders.

With a staking contract system, transferring the token is a lengthy process:
- Alice unstakes XYZ, receiving shares of past profits
- Alice transfers XYZ to Bob
- Bob stakes XYZ, starting to claim profits

With the SnapshotVault, the tracking of users' stake is achieved through ERC20Snapshot. Whenever XYZ fund pays out dividends, a snapshot of shareholders is taken.
- 1000 USDC distributed as dividends, snapshot 1 taken
- Alice transfers XYZ to Bob
- Alice can claim her share of snapshot 1 dividends
- Bob will be able to claim dividends for snapshot 2 if he holds XYZ until the next snapshot

SnapshotVault can have many uses:
- Distributing dividends
- Inflation protected token class

## Contracts
### SnapshotVault
A vault used to store and distribute cashflow tokens to shareholder token holders. The SnapshotVault is defined by its `shareholderToken` parameter which MUST be a token implementing the ERC20Snapshot extension. The token can have a variable supply since snapshots also store the total supply. The SnapshotVault `owner` address is responsible for triggerring snapshots: this can be delegated to a governance contract or a fixed periodical trigger. 
For greater flexibility, the SnapshotVault is designed to be able to distribute any ERC20 token. Before even taking a snapshot, an address must approve dividend tokens (eg. 1000USDC) that will be transferred to the vault. The `snapshot()` function then transfers the tokens from the approval address and takes a snapshot of the shareholders.

SnapshotVault functions:
- snapshot(cashflowTokenAddress): SNAPSHOT_ROLE-only function that takes snapshot and transfers cashflow tokens to vault.
- withdrawnOfAt(from, snapshotId): Amount of cashflow tokens already withdrawn by user.
- withdrawableOfAt(from, snapshotId): Amount of cashflow tokens withdrawable by user.
- withdraw(snapshotId, amount): Withdraw cashflow tokens for snapshot.

### ERC20InflationProtected
An ERC20Mintable token. Whenever tokens are minted by ERC20InflationProtected, X% of tokens are sent to SnapshotVault for dilution protected investors who also hold shares in the SnapshotVault. The SnapshotVault's share in ERC20InflationProtected is constant. Vault shareholders can become agnostic to the minting of new tokens by holding shares in the SnapshotVault proportional to their token holdings. For example, ABC token is mintable, and 10% of minted ABC is always sent to the vault represented by the ABCVault token.
- SnapshotVault always received 10% of minted ABC
- Alice holds 1% of ABC
To hedge her investment from future ABC inflation, Alice buys 10% of the ABCVault token. This 10% stake in ABCVault represents a 1% claim on all future minted tokens. Alice is now agnostic to ABC minting, as she will always have 1% of ABC supply regardless of how many tokens are minted.

ERC20InflationProtected hard codes the inflation protection of investors while also enabling flexible governance on the minting of tokens.

### Test Contracts
These are used for the purpose of testing but are also deployable as standalone contracts.
- ERC20MintableOwnable: Mintable ERC20 with an owner that can call mint().
- ERC20SnapshotOwnable: Snapshottable ERC20 with an owner that can call snapshot().

## Getting Started

### Installing

Save storage with [pnpm](https://pnpm.js.org/). You can also use regular NPM or Yarn.

```
pnpm install
```

### Directory Structure

```
lib
├── abi # abi output from src/
|
├── ethers # ethers contract abstractions codegenned from abis only (no bytecode)
│
├── solidity # the contracts themselves, in .sol form
│
├── truffle  # truffle contract abstractions codegenned from abis + bytecode
|
└── web3  # web3 contract abstractions codegenned from abis + bytecode
```

## Use Cases
### Distributing Dividends
TODO
### Inflation Protected Token
Many crypto projects have benefited from the use the ERC20 token standard to raise funding and/or to incentivize user behavior such through airdrops or staking programs. One challenge is the fair distribution of new tokens or of cashflows. Certain projects have opted for the use of staking, where users lock a certain amount of capital and periodically receive a preset amount of tokens every block. This system isn't ideal if users wish to use the token for other uses as they have to lock their token in the smart contract for the entire period. While some might argue that this the staking mechanism is a feature to prevent the selling the token, this barrier is purely artificial  when no minimum locking period is defined.

The most common approach is to set a fixed supply and allocate a certain share of tokens to various budget concerns such as founding team, investors, liquidity mining, legal and marketing. However, this approach is flawed due to its static nature and it often ends up being the case that planned budgeting items are over or under estimated. 

Mintable tokens have an uncapped token supply that can grow depending on certain factors such as a governance vote, staking or other protocol constraints. This removes the static constraint and enables a more dynamic allocation of tokens depending on how different actors interact. One stakeholder however, is often quite adverse to mintable tokens: investors. This is due to the dilution effect that minting creates. In such situations, each percentage point of dilution must be accompanied by equivalent growth in value of the protocol to preserve investor value.

A solution to these conflicting incentives is to have a special set of non-dilutive tokens that protect investor value by cancelling out dilution. For example, a dilution protected investors with 5% of the token supply will always have 5% of the supply regardless if the supply is 100 or 1 million. We can achieve this by using SnapshotVault and ERC20InflationProtected: with this architecture, investors with shares in the SnapshotVault can protect themselves from any future inflation.


## License

2021 Leo Vigna
MIT License.
