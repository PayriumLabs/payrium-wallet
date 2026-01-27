"use client";

import Link from "next/link";
import { Button, Logo } from "@/components/ui";
import { useWalletStore } from "@/stores/wallet-store";

export default function ImportSuccessPage() {
  const { address } = useWalletStore();

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Confetti / Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-3 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="absolute top-[15%] left-[20%] w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]" />
      </div>

       <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-8 relative z-10 animate-in-zoom">
        <div className="flex justify-center mb-8">
           <Logo />
        </div>

        <div className="flex flex-col items-center text-center">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-xl shadow-green-500/30 animate-scale-in">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "48px" }}>
              download_done
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Wallet Imported!
          </h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your wallet has been restored and is ready to use.
          </p>

          {/* Address Card */}
          {address && (
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-8 text-left">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Your Address</p>
              <div className="flex items-center gap-2">
                 <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {address.slice(2,4)}
                 </div>
                 <p className="text-slate-900 font-mono text-sm break-all font-medium">
                   {address}
                 </p>
              </div>
            </div>
          )}

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
