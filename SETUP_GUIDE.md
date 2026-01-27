# Payrium Wallet - Setup Guide

## 📋 What Was Built

This is the complete **Payrium Phase 1 MVP** - a non-custodial Web3 wallet Progressive Web App (PWA) for BNB Smart Chain with DAO governance functionality.

### Features Implemented

| Feature             | Description                                         |
| ------------------- | --------------------------------------------------- |
| **Wallet Creation** | Generate new wallet with 12-word mnemonic phrase    |
| **Wallet Import**   | Import existing wallet using recovery phrase        |
| **PIN Protection**  | AES-256-GCM encryption with 100k PBKDF2 iterations  |
| **Dashboard**       | View total balance, token list, and portfolio       |
| **Send Tokens**     | Send BNB and ERC-20 tokens with gas estimation      |
| **Receive**         | QR code display with copy/share functionality       |
| **Swap**            | Token swap interface (UI ready for DEX integration) |
| **Activity**        | Transaction history with status tracking            |
| **DAO Governance**  | View proposals, vote with PUM token power           |
| **Settings**        | Theme toggle, security options, wallet management   |

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (ES2020)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persistence
- **Blockchain**: ethers.js v6
- **Database**: Supabase (for DAO)
- **Icons**: Material Symbols (Google Fonts)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd payrium-wallet
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env.local
```

### 3. Configure Environment Variables

Edit `.env.local` with your values (see detailed setup below).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Configuration

### Required Variables

Create a `.env.local` file with the following:

```env
# ===========================================
# BSC RPC Configuration (REQUIRED)
# ===========================================

# BSC Mainnet RPC URL
# Options:
#   - Public (rate limited): https://bsc-dataseed.binance.org/
#   - Ankr: https://rpc.ankr.com/bsc
#   - QuickNode: Get from https://www.quicknode.com/
#   - NodeReal: Get from https://nodereal.io/
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/

# BSC Testnet RPC URL (for development)
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Which network to use: "mainnet" or "testnet"
NEXT_PUBLIC_ACTIVE_NETWORK=testnet

# ===========================================
# Supabase Configuration (REQUIRED FOR DAO)
# ===========================================

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ===========================================
# DAO Configuration
# ===========================================

# Admin wallet address (can create proposals)
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=0xYourAdminWalletAddress

# PUM Token contract address (for voting power)
NEXT_PUBLIC_PUM_TOKEN_ADDRESS=0xYourPumTokenAddress
```

---

## 🔗 BSC RPC Setup

### Option 1: Public RPCs (Free, Rate Limited)

Use these for development/testing:

```env
# Mainnet
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/

# Testnet
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

**Alternative public RPCs:**

- `https://bsc-dataseed1.binance.org/`
- `https://bsc-dataseed2.binance.org/`
- `https://rpc.ankr.com/bsc` (Ankr)

### Option 2: Premium RPCs (Recommended for Production)

For production, use a dedicated RPC provider:

#### QuickNode

1. Go to [quicknode.com](https://www.quicknode.com/)
2. Create a free account
3. Create a new endpoint → Select "BNB Smart Chain"
4. Copy the HTTP URL

#### NodeReal

1. Go to [nodereal.io](https://nodereal.io/)
2. Sign up for MegaNode
3. Create BSC endpoint
4. Copy the RPC URL

#### Ankr

1. Go to [ankr.com](https://www.ankr.com/rpc/)
2. Create account
3. Get premium BSC endpoint

---

## 🗄️ Supabase Setup (For DAO Features)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/)
2. Sign up / Log in
3. Click **"New Project"**
4. Choose organization and enter:
   - **Name**: `payrium-dao`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for project to initialize (~2 minutes)

### Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Paste the contents of `supabase/schema.sql`
4. Click **"Run"**

This creates:

- `proposals` table - Stores DAO proposals
- `votes` table - Stores user votes
- Necessary indexes and Row Level Security policies

### Step 4: Update Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🏛️ DAO Configuration

### Admin Wallet

Set the admin wallet address that can create proposals:

```env
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=0x71C7656EC7ab88b098defB751B7401B5f6d8976F
```

### PUM Token (Voting Power)

If you have deployed the PUM token contract:

```env
NEXT_PUBLIC_PUM_TOKEN_ADDRESS=0xYourDeployedPumTokenAddress
```

If not deployed yet, the DAO will work with mock data for testing.

---

## 📁 Project Structure

```
payrium-wallet/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Entry (redirects based on wallet state)
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── globals.css           # Tailwind + design tokens
│   │   ├── onboard/              # Welcome & setup screens
│   │   ├── wallet/
│   │   │   ├── create/           # New wallet flow
│   │   │   └── import/           # Import wallet flow
│   │   ├── unlock/               # PIN unlock screen
│   │   ├── dashboard/            # Main dashboard
│   │   ├── send/                 # Send transaction flow
│   │   ├── receive/              # Receive with QR
│   │   ├── swap/                 # Token swap
│   │   ├── activity/             # Transaction history
│   │   ├── dao/                  # DAO governance
│   │   └── settings/             # App settings
│   ├── components/
│   │   ├── layout/               # Header, SideNav, BottomNav
│   │   ├── providers/            # ThemeProvider
│   │   └── ui/                   # Button, Card, Modal, etc.
│   ├── lib/
│   │   ├── wallet/               # Wallet creation, encryption, storage
│   │   ├── blockchain/           # Chain config, provider, tokens
│   │   ├── transactions/         # Send & history
│   │   └── supabase/             # DAO client & operations
│   └── stores/                   # Zustand stores
├── public/
│   └── manifest.json             # PWA manifest
├── supabase/
│   └── schema.sql                # Database schema
├── .env.example                  # Environment template
└── SETUP_GUIDE.md                # This file
```

---

## 🔒 Security Notes

### What's Secure

- ✅ Private keys are **never sent to any server**
- ✅ Mnemonic is encrypted with AES-256-GCM
- ✅ 100,000 PBKDF2 iterations for brute-force resistance
- ✅ All encryption happens client-side in the browser
- ✅ Keys are stored encrypted in localStorage

### Best Practices

1. **Use HTTPS in production** - Required for Web Crypto API
2. **Use premium RPC** - Public RPCs have rate limits
3. **Enable Supabase RLS** - Already configured in schema
4. **Regular backups** - Remind users to save recovery phrase

---

## 🧪 Testing

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Testing Wallet Flow

1. Open app in browser
2. Click "Create New Wallet"
3. Save the 12-word recovery phrase
4. Set a 6-digit PIN
5. Access the dashboard

### Testing with Testnet

1. Set `NEXT_PUBLIC_ACTIVE_NETWORK=testnet`
2. Get testnet BNB from [BSC Faucet](https://testnet.binance.org/faucet-smart)
3. Test send/receive with testnet tokens

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push to GitHub
2. Import in [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables

### Self-Hosted

```bash
npm run build
npm run start
```

Use PM2 or Docker for production process management.

---

## 📞 Support

For issues or questions:

1. Check the error logs in browser console
2. Verify environment variables are set correctly
3. Ensure Supabase tables exist (run schema.sql)
4. Check RPC endpoint is responding

---

## 📝 Changelog

### v1.0.0-beta (Phase 1 MVP)

- Initial wallet creation and import
- PIN protection with encryption
- Dashboard with balance display
- Send/Receive functionality
- Swap interface (UI)
- DAO governance with voting
- Settings and theme toggle
- Mobile-responsive design
