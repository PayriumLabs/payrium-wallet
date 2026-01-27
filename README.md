# Payrium Wallet MVP

![Status](https://img.shields.io/badge/Status-Beta-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Network](https://img.shields.io/badge/Network-BSC-yellow)

**Payrium** is a non-custodial, decentralized Web3 wallet built for the Binance Smart Chain (BSC) ecosystem. It features robust security with client-side encryption, a seamless DAO governance interface for the PUM token, and a premium, responsive UI.

This repository contains the complete source code for the Payrium MVP (Frontend + Next.js Server Components).

---

## 🚀 Quick Start

For detailed setup instructions, including environment configuration and Supabase integration, please refer to the **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**.

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/payrium-labs/payrium-wallet.git

# Install dependencies
npm install

# Setup Environment
cp .env.example .env.local
# (Edit .env.local with your RPC keys and Supabase credentials)

# Run Development Server
npm run dev
```

---

## 📊 Current Status (MVP Phase 1)

We have successfully implemented the core wallet architecture and DAO features.

### ✅ Completed Features

- **Wallet Management**: Creation (Mnemonic generation), Import (Recovery Phrase), and Secure Storage (AES-256-GCM).
- **Security**: PIN protection, Client-side encryption, Auto-lock.
- **Dashboard**: Real-time BNB and Token balances, Portfolio view.
- **Transactions**: Send (Native & ERC20), Receive (QR Code), Activity History.
- **DAO Governance**: PUM Token voting mechanisms, Proposal viewing (Supabase integration).
- **UI/UX**: Responsive "Glassmorphism" design, Tailwind CSS styling, Mobile optimization.

### 🚧 In Progress / Planned Fixes

- **Swap Integration**: UI is ready; currently integrating 1inch/PancakeSwap API for live swaps.
- **Activity Feed**: Refining data fetching reliability from BscScan for internal transactions.

---

## 🗺️ Roadmap

### Phase 2: Enhanced DeFi (Upcoming)

- [ ] **DEX Aggregation**: Full swap functionality with best-rate finding.
- [ ] **Staking Dashboard**: Native staking for BNB and PUM tokens.
- [ ] **Fiat On-ramp**: Integration with providers (e.g., MoonPay/Transak) for direct card purchases.

### Phase 3: Ecosystem Expansion

- [ ] **NFT Gallery**: View and manage BSC NFTs.
- [ ] **WalletConnect v2**: Connect Payrium to other dApps as a signer.
- [ ] **Multi-chain Support**: Extending architecture to Ethereum and Polygon.

---

## 🤝 Contributing & Access

### Admin Access

Repositories users with `Admin` status have full access to:

- Manage repository settings and access control.
- Merge Pull Requests to `main`.
- Manage Secrets and CI/CD pipelines.

### Setup for Contributors

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📄 License

This project is proprietary software of Payrium Labs.
