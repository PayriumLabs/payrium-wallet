"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/layout";
import { Button, Logo } from "@/components/ui";
import { useWalletStore } from "@/stores/wallet-store";
import { formatAddress } from "@/lib/wallet";
import { useUIStore } from "@/stores/ui-store";

export default function ReceivePage() {
  const { address } = useWalletStore();
  const { showToast } = useUIStore();
  const [copied, setCopied] = useState(false);

  // If no address (should show loading or login), but for now render empty string or handle logic
  const walletAddress = address || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      showToast({ type: "success", message: "Address copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast({ type: "error", message: "Failed to copy address" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Payrium Wallet Address",
          text: walletAddress,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[100px] pointer-events-none opacity-50" />

      <div className="w-full max-w-md relative z-10">
        <Header title="Receive" showBack backHref="/dashboard" className="bg-transparent border-0 mb-4" />
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-6 md:p-8 animate-in-zoom">
          <div className="flex justify-center mb-6">
             <Logo showText={false} />
          </div>

          <div className="flex flex-col items-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Receive BNB</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
              <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">BNB Smart Chain</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-8">
             <div className="relative group cursor-pointer" onClick={handleCopy}>
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
                <div className="relative bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 group-hover:scale-[1.02] transition-transform duration-300">
                  <QRCodeSVG 
                    value={walletAddress} 
                    size={180}
                    level="Q"
                    includeMargin={false}
                    fgColor="#0F172A"
                  />
                  {/* Center Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="bg-white p-1 rounded-full shadow-md">
                        <div className="size-8 bg-[#F0B90B] rounded-full flex items-center justify-center text-[10px] font-bold">BNB</div>
                     </div>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100" onClick={handleCopy}>
            <div className="flex-1 min-w-0 mr-4">
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Your Address</p>
               <p className="text-slate-900 font-mono text-sm break-all font-medium leading-relaxed" suppressHydrationWarning>
                {walletAddress}
              </p>
            </div>
            <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 group-active:scale-95 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>content_copy</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
             <Button onClick={handleCopy} variant="secondary" className="flex-1">
               Copy
             </Button>
             <Button onClick={handleShare} className="flex-1 shadow-lg shadow-blue-500/20">
               Share
             </Button>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-amber-50/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 flex gap-3 animate-in-slide-up delay-100">
           <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "18px" }}>warning</span>
           </div>
           <div>
             <p className="text-amber-900 font-semibold text-sm">BNB Smart Chain (BEP20) Only</p>
             <p className="text-amber-700/80 text-xs leading-relaxed mt-1">
               Sending any other coins may result in permanent loss.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
