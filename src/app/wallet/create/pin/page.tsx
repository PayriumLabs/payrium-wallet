"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, PinInput, Logo } from "@/components/ui";
import { storeWallet } from "@/lib/wallet";
import { useWalletStore } from "@/stores/wallet-store";

export default function CreatePinPage() {
  const router = useRouter();
  const { setAddress, setHasWallet, setUnlocked } = useWalletStore();
  
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get temp data from session
  const [tempData, setTempData] = useState<{ mnemonic: string; address: string } | null>(null);

  useEffect(() => {
    const mnemonic = sessionStorage.getItem("temp_mnemonic");
    const address = sessionStorage.getItem("temp_address");
    
    if (!mnemonic || !address) {
      router.replace("/wallet/create");
      return;
    }
    
    setTempData({ mnemonic, address });
  }, [router]);

  const handlePinSubmit = () => {
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleConfirmSubmit = async () => {
    if (confirmPin !== pin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }

    if (!tempData) return;

    setIsLoading(true);
    setError("");

    try {
      // Store encrypted wallet
      await storeWallet(tempData.mnemonic, tempData.address, pin);
      
      // Update store
      setAddress(tempData.address);
      setHasWallet(true);
      setUnlocked(true);
      
      // Clear temp data
      sessionStorage.removeItem("temp_mnemonic");
      sessionStorage.removeItem("temp_address");
      
      // Navigate to success
      router.push("/wallet/create/success");
    } catch (err) {
      setError("Failed to create wallet. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-5">
        <button
          onClick={() => {
            if (step === "confirm") {
              setStep("create");
              setConfirmPin("");
              setError("");
            } else {
              router.back();
            }
          }}
          className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            arrow_back
          </span>
        </button>
        <h2 className="text-lg font-bold text-slate-900">Create PIN</h2>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "32px" }}>
            {step === "create" ? "lock" : "check_circle"}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
          {step === "create" ? "Create Your PIN" : "Confirm Your PIN"}
        </h3>
        <p className="text-slate-600 text-center mb-8">
          {step === "create"
            ? "This PIN will be used to unlock your wallet"
            : "Enter your PIN again to confirm"}
        </p>

        <div className="mb-8">
          <PinInput
            value={step === "create" ? pin : confirmPin}
            onChange={step === "create" ? setPin : setConfirmPin}
            error={!!error}
            autoFocus
          />
        </div>
      </div>

      {/* Action */}
      <div className="p-6 pb-8">
        {step === "create" ? (
          <Button
            onClick={handlePinSubmit}
            fullWidth
            size="lg"
            disabled={pin.length !== 6}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleConfirmSubmit}
            fullWidth
            size="lg"
            disabled={confirmPin.length !== 6}
            isLoading={isLoading}
          >
            Create Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
