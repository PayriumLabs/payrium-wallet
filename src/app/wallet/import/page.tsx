"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { validateMnemonic, importWallet } from "@/lib/wallet";

export default function ImportWalletPage() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Validate mnemonic
      const cleanMnemonic = mnemonic.trim().toLowerCase();
      
      if (!validateMnemonic(cleanMnemonic)) {
        setError("Invalid recovery phrase. Please check your words and try again.");
        setIsLoading(false);
        return;
      }

      // Import wallet to get address
      const walletData = importWallet(cleanMnemonic);
      
      // Store in session for PIN setup
      sessionStorage.setItem("temp_mnemonic", walletData.mnemonic);
      sessionStorage.setItem("temp_address", walletData.address);
      
      // Navigate to PIN setup
      router.push("/wallet/import/pin");
    } catch (err) {
      setError("Failed to import wallet. Please check your phrase and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = mnemonic.trim().split(/\s+/).filter(Boolean).length;
  const isValidLength = wordCount === 12 || wordCount === 24;

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-5">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            arrow_back
          </span>
        </button>
        <h2 className="text-lg font-bold text-slate-900">Import Wallet</h2>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Enter Recovery Phrase
          </h3>
          <p className="text-slate-600 text-sm">
            Enter your 12 or 24 word recovery phrase to import your wallet.
          </p>
        </div>

        {/* Mnemonic input */}
        <div className="mb-4">
          <textarea
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            placeholder="Enter your recovery phrase, separating each word with a space..."
            className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
          <div className="flex justify-between mt-2">
            <p className={`text-xs ${isValidLength ? "text-green-600" : "text-slate-500"}`}>
              {wordCount} / 12 words
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>

        {/* Security notice */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "20px" }}>
              security
            </span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">
                Keep Your Phrase Private
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Your recovery phrase is never sent to our servers. It stays on your device.
              </p>
            </div>
          </div>
        </div>

        {/* Quick input option */}
        <button
          onClick={() => {
            // Paste from clipboard
            navigator.clipboard.readText().then((text) => {
              setMnemonic(text);
            });
          }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            content_paste
          </span>
          Paste from Clipboard
        </button>
      </div>

      {/* Action */}
      <div className="p-6 pb-8">
        <Button
          onClick={handleImport}
          fullWidth
          size="lg"
          disabled={!isValidLength}
          isLoading={isLoading}
        >
          Import Wallet
        </Button>
      </div>
    </div>
  );
}
