"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout";
import { Button, PinInput } from "@/components/ui";
import { verifyPin, getStoredMnemonic } from "@/lib/wallet";
import { useUIStore } from "@/stores/ui-store";

export default function ExportPhrasePage() {
  const router = useRouter();
  const [step, setStep] = useState<"verify" | "display">("verify");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const { showToast } = useUIStore();

  const handleVerifyPin = async () => {
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

      // Get the mnemonic
      const storedMnemonic = await getStoredMnemonic(pin);
      if (storedMnemonic) {
        setMnemonic(storedMnemonic);
        setStep("display");
      } else {
        setError("Failed to retrieve recovery phrase");
      }
    } catch (err) {
      setError("Failed to verify PIN");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (mnemonic) {
      await navigator.clipboard.writeText(mnemonic);
      showToast({ type: "success", message: "Recovery phrase copied!" });
    }
  };

  const mnemonicWords = mnemonic?.split(" ") || [];

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header title="Export Recovery Phrase" showBack backHref="/settings" />

      {/* Verify PIN Step */}
      {step === "verify" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "32px" }}>
              key
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
            Enter Your PIN
          </h3>
          <p className="text-slate-600 text-center mb-8 max-w-sm">
            For security, please enter your PIN to view your recovery phrase.
          </p>

          <div className="mb-8">
            <PinInput
              value={pin}
              onChange={setPin}
              error={!!error}
              autoFocus
            />
          </div>

          <Button
            onClick={handleVerifyPin}
            size="lg"
            disabled={pin.length !== 6}
            isLoading={isLoading}
          >
            Verify PIN
          </Button>
        </div>
      )}

      {/* Display Mnemonic Step */}
      {step === "display" && mnemonic && (
        <div className="flex-1 flex flex-col px-6 pb-8">
          <div className="flex-1">
            {/* Warning */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: "20px" }}>
                  warning
                </span>
                <div>
                  <p className="text-red-800 font-semibold text-sm">
                    Keep This Private!
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    Never share your recovery phrase. Anyone with these words can steal your funds.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Your Recovery Phrase
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Write down these 12 words in order and store them safely.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {mnemonicWords.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2"
                >
                  <span className="text-slate-400 text-xs w-4">{index + 1}.</span>
                  <span className="text-slate-900 font-medium text-sm">{word}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                content_copy
              </span>
              Copy to Clipboard
            </button>
          </div>

          <Button onClick={() => router.push("/settings")} fullWidth size="lg" variant="secondary">
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
