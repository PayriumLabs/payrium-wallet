"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, PinInput, Logo } from "@/components/ui";
import { storeWallet } from "@/lib/wallet";
import { useWalletStore } from "@/stores/wallet-store";

export default function ImportPinPage() {
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
      router.replace("/wallet/import");
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
      router.push("/wallet/import/success");
    } catch (err) {
      setError("Failed to import wallet. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[100px] pointer-events-none opacity-50" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-8 relative z-10">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
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
            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
           <div className="scale-90 origin-right">
             <Logo />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "32px" }}>
              {step === "create" ? "lock" : "verified_user"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3 text-center tracking-tight">
            {step === "create" ? "Set Up PIN" : "Confirm PIN"}
          </h1>
          <p className="text-slate-500 text-center mb-10 text-sm max-w-[280px] leading-relaxed">
            {step === "create"
              ? "Set a 6-digit PIN to secure your wallet and encrypt your keys."
              : "Re-enter your PIN to verify and complete setup."}
          </p>

          <div className="mb-8 w-full flex justify-center">
            <PinInput
              value={step === "create" ? pin : confirmPin}
              onChange={step === "create" ? setPin : setConfirmPin}
              error={!!error}
              autoFocus
            />
          </div>

          <div className="w-full">
            {step === "create" ? (
              <Button
                onClick={handlePinSubmit}
                fullWidth
                size="lg"
                disabled={pin.length !== 6}
                className="h-14 text-lg shadow-xl shadow-blue-500/10"
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
                className="h-14 text-lg shadow-xl shadow-blue-500/10"
              >
                Import Wallet
              </Button>
            )}
            
            {error && (
               <p className="text-red-500 text-sm font-medium text-center mt-4 animate-in fade-in slide-in-from-top-1">
                 {error}
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
