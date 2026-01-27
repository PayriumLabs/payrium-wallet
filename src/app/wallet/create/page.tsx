"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createWallet } from "@/lib/wallet";
import { useUIStore } from "@/stores/ui-store";

export default function CreateWalletPage() {
  const router = useRouter();
  const { showToast } = useUIStore();
  const [step, setStep] = useState<"intro" | "generate" | "backup" | "verify">("intro");
  const [walletData, setWalletData] = useState<{ address: string; mnemonic: string } | null>(null);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [verifyError, setVerifyError] = useState("");

  const handleGenerate = () => {
    const data = createWallet();
    setWalletData(data);
    setStep("backup");
  };

  const handleCopyMnemonic = () => {
    if (walletData) {
      navigator.clipboard.writeText(walletData.mnemonic);
      showToast({ type: "success", message: "Recovery phrase copied!" });
    }
  };

  const handleContinueToVerify = () => {
    if (walletData) {
      // Shuffle words for verification
      const words = walletData.mnemonic.split(" ");
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      setSelectedWords([]); // Start with empty selection
      setVerifyError("");
      setStep("verify");
    }
  };

  const handleSelectWord = (word: string) => {
    setSelectedWords([...selectedWords, word]);
    setVerifyError("");
  };

  const handleRemoveWord = (index: number) => {
    const newSelected = selectedWords.filter((_, i) => i !== index);
    setSelectedWords(newSelected);
  };

  const handleVerify = () => {
    const entered = selectedWords.join(" ");
    if (entered === walletData?.mnemonic) {
      // Store mnemonic in session for PIN setup
      sessionStorage.setItem("temp_mnemonic", walletData.mnemonic);
      sessionStorage.setItem("temp_address", walletData.address);
      router.push("/wallet/create/pin");
    } else {
      setVerifyError("Words are in the wrong order. Please try again.");
    }
  };

  // Get available words (shuffled words that haven't been selected yet)
  const availableWords = shuffledWords.filter(
    (word, idx) => {
      // Count how many times this word appears in shuffled
      const countInShuffled = shuffledWords.filter(w => w === word).length;
      // Count how many times this word appears in selected
      const countInSelected = selectedWords.filter(w => w === word).length;
      // Check if this specific index should still be available
      const indicesOfThisWord = shuffledWords
        .map((w, i) => w === word ? i : -1)
        .filter(i => i !== -1);
      const selectedCount = selectedWords.filter(w => w === word).length;
      return indicesOfThisWord.indexOf(idx) >= selectedCount;
    }
  );

  // Simpler approach: track which indices have been used
  const getAvailableWords = () => {
    const usedIndices = new Set<number>();
    const available: { word: string; originalIndex: number }[] = [];
    
    // For each selected word, mark one shuffled index as used
    for (const selectedWord of selectedWords) {
      for (let i = 0; i < shuffledWords.length; i++) {
        if (shuffledWords[i] === selectedWord && !usedIndices.has(i)) {
          usedIndices.add(i);
          break;
        }
      }
    }
    
    // Return words at unused indices
    for (let i = 0; i < shuffledWords.length; i++) {
      if (!usedIndices.has(i)) {
        available.push({ word: shuffledWords[i], originalIndex: i });
      }
    }
    
    return available;
  };

  const mnemonicWords = walletData?.mnemonic.split(" ") || [];

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="flex-none flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <button 
          onClick={() => {
            if (step === "intro") router.back();
            else if (step === "generate") setStep("intro");
            else if (step === "backup") setStep("generate");
            else if (step === "verify") setStep("backup");
          }}
          className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Create Wallet</h2>
        </div>
        <div className="w-8" /> {/* Spacer */}
      </header>

      {/* Intro Step */}
      {step === "intro" && (
        <div className="flex-1 flex flex-col px-6 pb-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "40px" }}>
                security
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">
              Before We Start
            </h3>
            <p className="text-slate-600 text-center max-w-sm mb-8">
              We'll generate a 12-word recovery phrase. This is the <strong>only way</strong> to recover your wallet. Write it down and keep it safe.
            </p>

            <div className="w-full space-y-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "20px" }}>
                  warning
                </span>
                <div>
                  <p className="text-amber-800 font-semibold text-sm">Important</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Never share your recovery phrase with anyone. Payrium will never ask for it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} fullWidth size="lg">
            Generate Recovery Phrase
          </Button>
        </div>
      )}

      {/* Backup Step */}
      {step === "backup" && walletData && (
        <div className="flex-1 flex flex-col px-6 pb-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Your Recovery Phrase
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Write down these 12 words in order and keep them safe.
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
              onClick={handleCopyMnemonic}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                content_copy
              </span>
              Copy to Clipboard
            </button>

            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: "20px" }}>
                  error
                </span>
                <p className="text-red-700 text-sm">
                  If you lose this phrase, you will lose access to your wallet and funds forever.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleContinueToVerify} fullWidth size="lg">
            I've Saved My Phrase
          </Button>
        </div>
      )}

      {/* Verify Step */}
      {step === "verify" && (
        <div className="flex-1 flex flex-col px-6 pb-8">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Verify Your Phrase
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Tap the words in the correct order to verify you've saved them.
            </p>

            {/* Selected words area */}
            <div className="min-h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              {selectedWords.length === 0 ? (
                <p className="text-slate-400 text-sm text-center">
                  Tap words below in the correct order
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedWords.map((word, index) => (
                    <button
                      key={`selected-${index}`}
                      onClick={() => handleRemoveWord(index)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <span className="text-white/70 text-xs">{index + 1}.</span>
                      {word}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {verifyError && (
              <p className="text-red-500 text-sm mb-4 text-center">{verifyError}</p>
            )}

            {/* Available words */}
            <div className="flex flex-wrap gap-2 justify-center">
              {getAvailableWords().map(({ word, originalIndex }) => (
                <button
                  key={`available-${originalIndex}`}
                  onClick={() => handleSelectWord(word)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleVerify}
            fullWidth
            size="lg"
            disabled={selectedWords.length !== 12}
          >
            Verify & Continue
          </Button>
        </div>
      )}
    </div>
  );
}
