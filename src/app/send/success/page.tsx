"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function SendSuccessPage() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor - Subtle Premium Mesh */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700" />
      
      {/* Confetti particles (Simple CSS representation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {/* We could add CSS-based particles here later, keeping it clean for now */}
      </div>

      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 animate-in-slide-up duration-500">
        
        {/* Success Animation Container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-green-400/20 blur-2xl rounded-full scale-110 animate-pulse"></div>
          <div className="relative size-24 rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-xl shadow-green-500/30 flex items-center justify-center animate-bounce-in">
             <span className="material-symbols-outlined text-white" style={{ fontSize: "48px" }}>check</span>
          </div>
          {/* Ripple rings */}
          <div className="absolute inset-0 border-2 border-green-500/20 rounded-full animate-ping duration-[3000ms]"></div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Sent Successfully!
        </h1>
        <p className="text-slate-500 font-medium mb-10">
          Your transaction is being processed.
        </p>

        {/* Transaction Card */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-6 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
           <div className="flex flex-col items-center border-b border-slate-100 pb-6 mb-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Amount</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-extrabold text-slate-900 tracking-tight">- 1,200</span>
                 <span className="text-lg font-bold text-slate-500">USDC</span>
              </div>
              <p className="text-slate-400 text-sm font-medium mt-1">≈ $1,200.00</p>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between group">
                 <span className="text-slate-500 font-medium">To</span>
                 <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="size-5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                    <span className="text-slate-900 font-mono font-medium text-sm">0x71C...9E3F</span>
                    <span className="material-symbols-outlined text-slate-300 text-[14px]">content_copy</span>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                 <span className="text-slate-500 font-medium">Network</span>
                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                    <span className="text-slate-900 font-bold text-xs">BSC Chain</span>
                 </div>
              </div>

               <div className="flex items-center justify-between">
                 <span className="text-slate-500 font-medium">Fee</span>
                 <span className="text-slate-900 font-medium text-sm">0.0001 BNB</span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <Link href="/dashboard" className="block w-full">
            <Button fullWidth size="lg" className="h-14 text-lg shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700 border-green-500">
               Done
            </Button>
          </Link>
          
          <button className="w-full py-3 rounded-xl text-primary font-bold text-sm bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
            <span>View on BscScan</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
          </button>
        </div>
      </div>
    </div>
  );
}
