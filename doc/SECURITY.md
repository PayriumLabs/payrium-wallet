# Security Overview & Roadmap

## Current Architecture (MVP Phase)

In the current MVP phase, Payrium Wallet uses a **self-custodial, client-side** security model.

### Key Features

- **Local Storage**: Encrypted Wallet Mnemonic is stored in the browser's `localStorage`.
- **Encryption**: Data is encrypted using **AES-256-GCM** derived from the user's PIN via **PBKDF2** (100,000 iterations).
- **Client-Side Signing**: All transactions are signed locally within the browser. Private keys never leave the user's device.

### Limitations

- **Device Dependent**: If the user clears their browser cache or loses the device without backing up their mnemonic, funds are lost.
- **XSS Vulnerability**: Storing sensitive data in `localStorage` is susceptible to Cross-Site Scripting (XSS) attacks if the application is compromised.

---

## Upgrade Path (Post-MVP)

To move from MVP to a production-grade financial product, we plan to implement the following security upgrades:

### 1. Secure Enclave / Biometrics (Mobile App)

- **Transition**: Move from Web-only to Native Mobile (React Native / Swift).
- **Benefit**: Utilize device Secure Enclave (iOS/Android) for hardware-level key protection instead of `localStorage`.

### 2. Session Management

- **Implementation**: clear sensitive data from memory after short periods of inactivity.
- **Benefit**: Protects against physical access attacks if a device is left unlocked.

### 3. MPC (Multi-Party Computation)

- **Long-term Goal**: Implement MPC wallets (e.g., using Fireblocks or Web3Auth).
- **Benefit**: Splits the private key into "shares" distributed across the user's device and a security server. Removes the single point of failure (Key Loss) and enables social recovery.

### 4. Ledger / Hardware Support

- **Planned Feature**: Allow users to connect Ledger/Trezor for "Cold Storage" of significant funds.
