"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, PinInput } from "@/components/ui";
import { verifyPin, getStoredAddress, getWalletMeta, clearWalletData } from "@/lib/wallet";
import { useWalletStore } from "@/stores/wallet-store";

export default function UnlockPage() {
  const router = useRouter();
  const { setAddress, setUnlocked, reset } = useWalletStore();
  
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletName, setWalletName] = useState("My Wallet");
  const [address, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get wallet info
    const storedAddress = getStoredAddress();
    const meta = getWalletMeta();
    
    if (!storedAddress) {
      router.replace("/onboard");
      return;
    }
    
    setWalletAddress(storedAddress);
    if (meta?.name) {
      setWalletName(meta.name);
    }
  }, [router]);

  const resetWallet = () => {
    clearWalletData();
    reset();
    router.replace("/onboard");
  };

  const handleUnlock = async () => {
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await verifyPin(pin);
      
      if (!isValid) {
        setError("Incorrect PIN. Please try again.");
        setPin("");
        setIsLoading(false);
        return;
      }

      // Update store
      if (address) {
        setAddress(address);
      }
      setUnlocked(true);
      
      // Navigate to dashboard
      router.replace("/dashboard");
    } catch (err) {
      setError("Failed to unlock wallet. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && !isLoading) {
      handleUnlock();
    }
  }, [pin]);

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Wallet icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">
          Welcome Back
        </h1>
        <p className="text-slate-600 text-center mb-2">
          {walletName}
        </p>
        {address && (
          <p className="text-slate-500 text-sm font-mono mb-8">
            {formatAddress(address)}
          </p>
        )}

        <p className="text-slate-600 text-center mb-6">
          Enter your 6-digit PIN to unlock your wallet.
        </p>

        {/* PIN Input */}
        <div className="mb-8 flex justify-center">
          <PinInput
            value={pin}
            onChange={setPin}
            length={6}
            error={!!error}
            disabled={isLoading}
            autoFocus
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-6 animate-pulse">
            {error}
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: "20px" }}>
              progress_activity
            </span>
            <span className="text-sm font-medium">Unlocking...</span>
          </div>
        )}

        {/* Buttons */}
        <div className="text-center mt-auto pb-8">
          <Button
            variant="ghost" 
            className="text-primary hover:text-primary-dark hover:bg-transparent text-sm mb-4"
            disabled={isLoading}
            onClick={resetWallet}
          >
            Forgot PIN? Reset Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
