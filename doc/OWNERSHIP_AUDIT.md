# Contract Ownership & Role Audit

**File**: `contracts/PayriumToken.sol`

## Executive Summary

**Current Status**: Fixed Supply, Ownerless Contract.

The current implementation of the `PayriumToken` is a simplified ERC-20 token. It does **not** contain administrative features such as `AccessControl`, `Ownable`, or `Roles`.

## Detailed Findings

### 1. Ownership (`onlyOwner`)

- **Status**: ❌ Not Implemented.
- **Implication**: There is no "owner" variable in the contract storage. Once deployed, the contract logic is immutable. No wallet (including the deployer) has special privileges to pause the contract, blacklist addresses, or upgrade functions.
- **Benefit**: This makes the token "trustless" and decentralized immediately upon deployment.

### 2. Minting Roles (`MINTER_ROLE`)

- **Status**: ❌ Not Implemented.
- **Implication**: The `_mint` function is `internal` and is executed **only once** inside the `constructor`.
- **Result**: The supply is securely hard-capped at 200,000,000 PUM. No additional tokens can ever be minted.

## How to "Transfer" Control

Since there is no contract owner to change, you cannot "transfer ownership" of the code itself. However, you can transfer control of the **Economy**.

- **Deployer**: Received 100% of the supply (200M PUM) at deployment.
- **Action**: To transfer control, we will simply **transfer the tokens** from the Deployer Wallet to the intended Admin or DAO Treasury wallet.
- **Who Rules?**: Whoever holds the tokens holds the power in this economy.

## Recommendation for Mainnet

- **Option A (Keep Current)**: Best for a "Bitcoin-like" fixed supply model. Secure and simple.
- **Option B (Upgrade)**: If we require features like _Minting more tokens later_, _Pausing transfers_, or _Blacklisting_, we will rewrite the contract to inherit from OpenZeppelin's `AccessControl` and `ERC20Burnable`/`ERC20Pausable` before the Mainnet launch.
