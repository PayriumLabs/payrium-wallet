"use client";

import Link from "next/link";
import { Button, Logo } from "@/components/ui";
import { useWalletStore } from "@/stores/wallet-store";
import { formatAddress } from "@/lib/wallet";

export default function CreateSuccessPage() {
  const { address } = useWalletStore();

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Confetti / Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-3 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
          <div className="absolute top-[30%] left-[30%] w-4 h-4 bg-yellow-400 rounded-lg animate-bounce [animation-delay:0.5s] rotate-12" />
          <div className="absolute top-[25%] right-[10%] w-3 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:0.7s]" />
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-8 relative z-10 animate-in-zoom">
        <div className="flex justify-center mb-8">
           <Logo />
        </div>

        <div className="flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 animate-scale-in">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "48px" }}>
              check
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Wallet Created!
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your secure non-custodial wallet is ready.
          </p>

          {/* Address Card */}
          {address && (
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-8 text-left">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Your Address</p>
              <div className="flex items-center gap-2">
                 <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {address.slice(2,4)}
                 </div>
                 <p className="text-slate-900 font-mono text-sm break-all font-medium">
                   {address}
                 </p>
              </div>
            </div>
          )}
          
          <div className="space-y-3 w-full mb-8">
             <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl text-left">
                <span className="material-symbols-outlined text-blue-600 shrink-0 mt-0.5" style={{ fontSize: "20px" }}>security</span>
                <p className="text-blue-900 text-sm font-medium">Your recovery phrase is the only way to restore this wallet.</p>
             </div>
             <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl text-left">
                <span className="material-symbols-outlined text-emerald-600 shrink-0 mt-0.5" style={{ fontSize: "20px" }}>account_balance_wallet</span>
                <p className="text-emerald-900 text-sm font-medium">Top up with BNB to start transacting.</p>
             </div>
          </div>

          <Link href="/dashboard" className="w-full">
            <Button fullWidth size="lg" className="h-14 text-lg shadow-xl shadow-blue-500/20">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
