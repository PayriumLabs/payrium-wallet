"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function OnboardStartPage() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Payrium</h1>
            <p className="text-xs text-slate-500">Simple Payments on BSC</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: "48px", fontVariationSettings: "'FILL' 1" }}
          >
            wallet
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
          Let's Set Up Your Wallet
        </h2>
        <p className="text-slate-600 text-center max-w-sm mb-12">
          Create a new wallet or import an existing one using your recovery phrase.
        </p>
      </div>

      {/* Actions */}
      <div className="p-6 pb-8 space-y-4">
        <Link href="/wallet/create" className="block">
          <Button fullWidth size="lg">
            <span className="material-symbols-outlined mr-2" style={{ fontSize: "20px" }}>
              add
            </span>
            Create New Wallet
          </Button>
        </Link>

        <Link href="/wallet/import" className="block">
          <Button variant="secondary" fullWidth size="lg">
            <span className="material-symbols-outlined mr-2" style={{ fontSize: "20px" }}>
              download
            </span>
            Import Existing Wallet
          </Button>
        </Link>

        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our{" "}
          <button className="text-primary hover:underline">Terms of Service</button>
          {" "}and{" "}
          <button className="text-primary hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}
