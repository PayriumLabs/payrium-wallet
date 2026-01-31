# Payrium MVP: Demo Prep & Launch Guide

**Target Date:** End of January 2026 (Immediate Execution)

This guide outlines the steps to prepare for your founder presentation and the immediate timeline for releasing the public MVP.

---

## 📅 Part 1: Launch Timeline (Immediate)

Since we are at the end of January, the timeline is aggressive.

### **Day 0: Final Polish (Today - Jan 31)**

- [x] **Code Freeze**: No new features. Only critical bug fixes.
- [x] **Liquidity Check**: Ensure PUM-BNB pool has liquidity (Completed).
- [ ] **Data Reset**: clear your local browser or use Incognito mode for the demo to show the "First Time User" experience.
- [ ] **Deployment**: Ensure Vercel deployment is live and synced with the latest Git commit.

### **Day 1: The Presentation / Soft Launch (Feb 1)**

- **Morning**: Record the "Demo Video" (see script below).
- **Afternoon**: Share the standard "Welcome to Payrium" post on Twitter/Discord.
- **Evening**: Open access to a small "Alpha Group" (10-50 users) to test live.

### **Day 2-7: Post-Launch Feedback**

- Monitor Supabase logs for failed votes.
- Gather feedback on UI/UX.
- **Goal**: 100 successful swaps and 50 governance votes.

---

## 🎬 Part 2: Demo Presentation Script

Use this flow to demonstrate the full capabilities of Payrium in under 5 minutes.

### **Step 1: The "Hook" (Value Prop)**

- "Payrium isn't just a wallet; it's a seamless gateway to the PUM Token ecosystem. We've combined non-custodial security with instant governance utility."

### **Step 2: Wallet Creation (Show Simplicity)**

1.  Open App (Incognito window).
2.  Click **"Create Wallet"**.
3.  Show the **Mnemonic Phrase** (Explain: "This is Client-Side Security. We never see your keys.").
4.  Copy/Paste to verify.
5.  **Result**: Dashboard loads instantly.

### **Step 3: The "Magic" (Swap)**

- _Pre-requisite: Have a second browser window open with a wallet that ALREADY has Testnet BNB, or send BNB to the new wallet live._

1.  Go to **Swap Tab**.
2.  Input: **0.01 BNB**.
3.  Output: **~PUM** (Show the quote loading).
4.  Click **Swap**.
5.  **Result**: "Transaction Confirmed" toast appears. Balance updates immediately.

### **Step 4: Governance (The "Why")**

1.  Go to **DAO Tab**.
2.  Show the **"Voting Power"** (It should now show your PUM balance).
3.  Click on a Proposal.
4.  Cast a Vote ("Yes").
5.  **Result**: "Vote Registered" success message.

### **Step 5: Closing**

- "This is live on BSC Testnet today. It's fast, secure, and ready for our community."

---

## 🛠️ Part 3: Pre-Demo Technical Checklist

**Before you share your screen:**

1.  **Environment**:

    - [ ] `.env.local` is correct (PUM Address: `0xa4d0...be9e`).
    - [ ] Network set to **BSC Testnet**.

2.  **Browser**:

    - [ ] Close unnecessary tabs.
    - [ ] Have **BscScan Testnet** open in a separate tab to show transaction proofs if asked.
    - [ ] Clear Cache/Cookies for `localhost:3000` to ensure a clean start.

3.  **Liquidity**:

    - [ ] Double-check Swapping 0.01 BNB works (Do a dry run 10 mins before).

4.  **Backup**:
    - [ ] Have the **"Admin Wallet"** private key ready in case you need to fund a user or fix a proposal live.

---

## ⚠️ Known MVP Scope (FAQ)

**Q: Is this audited?**

- "This is the MVP Alpha on Testnet. Contracts are standard ERC-20/OpenZeppelin. A full audit is scheduled for Phase 3 (Mainnet)."

**Q: Where are the keys stored?**

- "Encrypted locally on your device (AES-256). We are non-custodial."

**Q: Why Testnet?**

- "To allow the community to test features without risking real funds during the Alpha phase."
