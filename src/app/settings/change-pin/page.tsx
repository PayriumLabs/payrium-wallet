"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout";
import { Button, PinInput } from "@/components/ui";
import { verifyPin, changePin } from "@/lib/wallet";
import { useUIStore } from "@/stores/ui-store";

export default function ChangePinPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [step, setStep] = useState<"current" | "new" | "confirm">("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyCurrentPin = async () => {
    if (currentPin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await verifyPin(currentPin);
      
      if (!isValid) {
        setError("Incorrect PIN. Please try again.");
        setCurrentPin("");
        setIsLoading(false);
        return;
      }

      setStep("new");
    } catch (err) {
      setError("Failed to verify PIN");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPinSubmit = () => {
    if (newPin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }

    if (newPin === currentPin) {
      setError("New PIN must be different from current PIN");
      return;
    }

    setError("");
    setStep("confirm");
  };

  const handleConfirmPin = async () => {
    if (confirmPin !== newPin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await changePin(currentPin, newPin);
      
      if (success) {
        showToast({ type: "success", message: "PIN changed successfully!" });
        router.push("/settings");
      } else {
        setError("Failed to change PIN. Please try again.");
      }
    } catch (err) {
      setError("Failed to change PIN");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "current": return "Enter Current PIN";
      case "new": return "Create New PIN";
      case "confirm": return "Confirm New PIN";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "current": return "Enter your current PIN to continue";
      case "new": return "Enter a new 6-digit PIN";
      case "confirm": return "Enter your new PIN again to confirm";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case "current": return "lock";
      case "new": return "lock_reset";
      case "confirm": return "check_circle";
    }
  };

  const handleBack = () => {
    if (step === "current") {
      router.back();
    } else if (step === "new") {
      setStep("current");
      setNewPin("");
      setError("");
    } else if (step === "confirm") {
      setStep("new");
      setConfirmPin("");
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header title="Change PIN" showBack backHref="/settings" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "32px" }}>
            {getStepIcon()}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
          {getStepTitle()}
        </h3>
        <p className="text-slate-600 text-center mb-8">
          {getStepDescription()}
        </p>

        <div className="mb-8">
          {step === "current" && (
            <PinInput
              value={currentPin}
              onChange={setCurrentPin}
              error={!!error}
              autoFocus
            />
          )}
          {step === "new" && (
            <PinInput
              value={newPin}
              onChange={setNewPin}
              error={!!error}
              autoFocus
            />
          )}
          {step === "confirm" && (
            <PinInput
              value={confirmPin}
              onChange={setConfirmPin}
              error={!!error}
              autoFocus
            />
          )}
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          {step !== "current" && (
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          
          {step === "current" && (
            <Button
              onClick={handleVerifyCurrentPin}
              disabled={currentPin.length !== 6}
              isLoading={isLoading}
              fullWidth
            >
              Continue
            </Button>
          )}
          
          {step === "new" && (
            <Button
              onClick={handleNewPinSubmit}
              disabled={newPin.length !== 6}
              className="flex-1"
            >
              Continue
            </Button>
          )}
          
          {step === "confirm" && (
            <Button
              onClick={handleConfirmPin}
              disabled={confirmPin.length !== 6}
              isLoading={isLoading}
              className="flex-1"
            >
              Change PIN
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
