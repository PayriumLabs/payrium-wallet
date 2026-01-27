"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout";
import { Button, Input, Modal } from "@/components/ui";
import { isValidAddress } from "@/lib/wallet";
import { useWalletStore } from "@/stores/wallet-store";
import { useUIStore } from "@/stores/ui-store";
import { useBalances } from "@/lib/hooks/useBalances";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { hasStoredWallet, verifyPin, unlockWallet } from "@/lib/wallet/storage";
import { getProvider } from "@/lib/blockchain/provider";

export default function SendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "BNB";
  
  const { address } = useWalletStore();
  const { native, tokens, refresh } = useBalances(address || undefined);
  
  const { showToast } = useUIStore();

  const [step, setStep] = useState<"address" | "amount" | "review" | "pin">("address");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState("");

  // Token Selection
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(initialToken);

  // Update selected token if params change (e.g. navigation)
  useEffect(() => {
     const tokenParam = searchParams.get("token");
     if (tokenParam) {
         setSelectedTokenSymbol(tokenParam.toUpperCase());
     }
  }, [searchParams]);

  // Combine Native + Tokens
  const allTokens = useMemo(() => {
    return [
      {
        symbol: native.symbol,
        name: "Binance Coin",
        balance: native.balance,
        address: "BNB",
        decimals: 18,
        isNative: true,
        logo: null,
        price: 650.20 // Mock
      },
      ...tokens.map(t => ({
        symbol: t.symbol,
        name: t.name,
        balance: t.balanceFormatted,
        address: t.address,
        decimals: t.decimals,
        isNative: false,
        logo: null, // Mock missing prop
        price: 1.00 // Mock missing prop
      }))
    ];
  }, [tokens, native]);

  const activeToken = allTokens.find(t => t.symbol === selectedTokenSymbol) || allTokens[0];

  const handleAddressSubmit = () => {
    if (!recipient) {
      setAddressError("Please enter a recipient address");
      return;
    }
    
    if (!isValidAddress(recipient)) {
      setAddressError("Invalid wallet address");
      return;
    }
    
    setAddressError("");
    setStep("amount");
  };

  const handleAmountSubmit = () => {
    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(activeToken.balance);
    
    if (!amount || amountNum <= 0) {
      setAmountError("Please enter a valid amount");
      return;
    }
    
    if (amountNum > balanceNum) {
      setAmountError("Insufficient balance");
      return;
    }
    
    setAmountError("");
    setStep("review");
  };

  const handleReviewConfirm = () => {
      // Always require PIN for internal wallet
      if (hasStoredWallet()) {
           setStep("pin");
      } else {
           // For dev/testing if no internal wallet exists, maybe fallback or error
           // But user explicit request is "access our own created web wallet"
           showToast({ type: "error", message: "No internal wallet found" });
      }
  };

  const handlePinSubmit = async () => {
      if (pin.length < 4) return;
      
      try {
           setIsSending(true);
           // Small delay to prevent flickering
           await new Promise(r => setTimeout(r, 500));
           
           // Verify PIN first (UI feedback)
           const isValid = await verifyPin(pin);
           if (!isValid) {
               setPinError("Invalid PIN");
               setIsSending(false);
               return;
           }
           
           await executeSend(pin);
      } catch (e) {
           console.error(e);
           setPinError("Verification failed");
           setIsSending(false);
      }
  };

  const executeSend = async (verifiedPin: string) => {
    setIsSending(true);
    try {
        // Unlock internal wallet
        const mnemonic = await unlockWallet(verifiedPin);
        if (!mnemonic) throw new Error("Failed to unlock wallet");

        // Connect to blockchain
        const provider = getProvider(); // Uses environment RPC URL
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        const signer = wallet.connect(provider);
        
        let tx;
        if (activeToken.isNative) {
            // Native BNB Transfer
            const value = ethers.parseEther(amount);
            tx = await signer.sendTransaction({
                to: recipient,
                value: value
            });
        } else {
            // ERC-20 Token Transfer
            const tokenContract = new ethers.Contract(
                activeToken.address, 
                ["function transfer(address to, uint256 amount) public returns (bool)"], 
                signer
            );
            const value = ethers.parseUnits(amount, activeToken.decimals);
            tx = await tokenContract.transfer(recipient, value);
        }

        setTxHash(tx.hash);
        showToast({ type: "info", message: "Transaction submitted..." });
        
        await tx.wait();
        
        showToast({ type: "success", message: `Sent ${amount} ${activeToken.symbol}!` });
        refresh(); // Update balances
        router.push("/dashboard");
    } catch (error: any) {
        console.error("Send failed", error);
        showToast({ type: "error", message: error.message || "Transaction failed" });
    } finally {
        setIsSending(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text);
    } catch (err) {
      console.error("Failed to paste:", err);
      showToast({ type: "error", message: "Failed to paste from clipboard" });
    }
  };

  const handleMax = () => {
    // If BNB, leave some for gas (0.002)
    const balance = parseFloat(activeToken.balance);
    if (activeToken.symbol === "BNB" || activeToken.symbol === "tBNB") {
       const max = Math.max(0, balance - 0.002);
       setAmount(max.toFixed(4));
    } else {
       setAmount(balance.toString());
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header
        title={step === "review" ? "Review & Send" : "Send"}
        showBack={step === "address"}
        backHref={step === "address" ? "/dashboard" : undefined}
        rightContent={<div />}
      />

      {/* Address Step */}
      {step === "address" && (
        <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full animate-in-slide-up">
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Recipient
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Enter the wallet address or ENS name
              </p>

              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                error={addressError}
                className="h-14 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-slate-900"
                rightIcon={
                  <button
                    onClick={handlePaste}
                    className="text-primary text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Paste
                  </button>
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group active:scale-95">
                <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "24px" }}>
                    qr_code_scanner
                  </span>
                </div>
                <span className="text-slate-900 font-semibold text-sm">Scan QR</span>
              </button>
               <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group active:scale-95">
                <div className="size-12 rounded-full bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontSize: "24px" }}>
                    history
                  </span>
                </div>
                <span className="text-slate-900 font-semibold text-sm">Recent</span>
              </button>
            </div>
          </div>

          <Button onClick={handleAddressSubmit} fullWidth size="lg" className="h-14 text-lg shadow-xl shadow-blue-500/20">
            Continue
          </Button>
        </div>
      )}

      {/* Amount Step */}
      {step === "amount" && (
        <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full animate-in-slide-up">
          <div className="flex items-center justify-between mb-6">
             <button
              onClick={() => setStep("address")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
              <span className="text-sm font-medium">Recipient</span>
            </button>
             <div className="px-3 py-1 bg-slate-100 rounded-full">
                <span className="text-xs font-mono text-slate-600">{formatAddress(recipient)}</span>
             </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            {/* Token Card - Clickable */}
            <button 
              onClick={() => setIsTokenModalOpen(true)}
              className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all rounded-2xl mb-8 group active:scale-[0.98]"
            >
              <div className={cn(
                  "size-12 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-md transition-transform group-hover:scale-105",
                  activeToken.symbol === "BNB" || activeToken.symbol === "tBNB" ? "bg-[#F0B90B] shadow-amber-500/20" : "bg-slate-100"
                )}>
                  {(activeToken.symbol === "BNB" || activeToken.symbol === "tBNB") ? "BNB" : activeToken.symbol[0]}
              </div>
              <div className="flex-1 text-left">
                <p className="text-slate-900 font-bold text-lg">{activeToken.symbol}</p>
                <p className="text-slate-500 text-sm">{activeToken.name}</p>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-1 justify-end text-slate-900 font-medium">
                    {activeToken.balance}
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                 </div>
                 <p className="text-slate-400 text-xs">Available</p>
              </div>
            </button>

            {/* Amount Input Large */}
            <div className="relative w-full mb-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-center text-6xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 placeholder:text-slate-200 p-0 tracking-tight"
                autoFocus
              />
            </div>
            <p className="text-slate-500 font-medium mb-8">
              ≈ ${(parseFloat(amount || "0") * activeToken.price).toFixed(2)} USD
            </p>

            <button
               onClick={handleMax}
               className="px-6 py-2 rounded-full bg-blue-50 text-primary text-sm font-bold hover:bg-blue-100 transition-colors uppercase tracking-wide"
             >
               Use Max
             </button>
            
            {amountError && (
               <p className="text-red-500 text-sm font-medium mt-4 animate-bounce">{amountError}</p>
            )}
          </div>

          <Button onClick={handleAmountSubmit} fullWidth size="lg" className="h-14 text-lg shadow-xl shadow-blue-500/20">
            Review Transfer
          </Button>
        </div>
      )}

      {/* Review Step */}
      {step === "review" && (
        <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full animate-in-slide-up">
          <div className="flex-1">
             <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6">
                <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
                  <p className="text-slate-500 text-sm font-medium mb-2">You are sending</p>
                  <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {amount} <span className="text-2xl text-slate-500 align-baseline">{activeToken.symbol}</span>
                  </p>
                  <p className="text-slate-400 font-medium mt-1">
                    ≈ ${(parseFloat(amount) * activeToken.price).toFixed(2)} USD
                  </p>
                </div>
                
                <div className="p-6 space-y-5">
                   {/* To */}
                   <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">To</span>
                      <div className="flex items-center gap-2">
                         <div className="size-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                         <span className="text-slate-900 font-mono font-medium">{formatAddress(recipient)}</span>
                      </div>
                   </div>
                   
                   {/* Network */}
                   <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Network</span>
                      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg">
                         <span className="text-slate-900 font-bold text-xs">BNB Smart Chain</span>
                      </div>
                   </div>

                   {/* Fee */}
                   <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Network Fee</span>
                      <span className="text-slate-900 font-medium">~0.0001 BNB</span>
                   </div>
                   
                   <div className="h-px bg-slate-100 my-2"></div>
                   
                   {/* Total */}
                   <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-bold">Total Cost</span>
                      <span className="text-primary font-bold text-lg">
                        {activeToken.symbol === "BNB" || activeToken.symbol === "tBNB"
                          ? (parseFloat(amount) + 0.0001).toFixed(4) 
                          : `${amount} ${activeToken.symbol} + 0.0001 BNB`}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <Button 
                onClick={() => setStep("amount")} 
                size="lg" 
                variant="secondary"
                className="flex-1"
                disabled={isSending}
              >
                Back
             </Button>
            <Button onClick={handleReviewConfirm} size="lg" className="flex-[2] h-14 text-lg shadow-xl shadow-blue-500/20" disabled={isSending}>
              Confirm & Send
            </Button>
          </div>
        </div>
      )}

      {/* PIN Verification Step */}
      {step === "pin" && (
        <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full animate-in-slide-up bg-white">
           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="size-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined text-primary text-3xl">lock</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enter PIN</h2>
              <p className="text-slate-500 text-center mb-8">
                Please enter your wallet PIN to confirm this transaction.
              </p>

              <div className="w-full max-w-[280px]">
                 <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                        const val = e.target.value;
                        const numeric = val.split('').filter((c: string) => c >= '0' && c <= '9').join('');
                        setPin(numeric);
                        setPinError("");
                    }}
                    className="w-full text-center text-3xl font-bold tracking-[8px] h-16 rounded-2xl border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    autoFocus
                    placeholder="••••••"
                 />
                 {pinError && (
                    <p className="text-red-500 text-sm font-medium text-center mt-3 animate-shake">
                        {pinError}
                    </p>
                 )}
              </div>
           </div>

           <div className="flex gap-4">
             <Button 
                onClick={() => setStep("review")} 
                size="lg" 
                variant="secondary"
                className="flex-1"
                disabled={isSending}
              >
                Back
             </Button>
             <Button 
                onClick={handlePinSubmit} 
                size="lg" 
                className="flex-[2]"
                disabled={pin.length < 4 || isSending}
              >
                {isSending ? "Verifying..." : "Confirm"}
              </Button>
           </div>
        </div>
      )}

      {/* Token Selector Modal */}
      <Modal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        title="Select Asset"
      >
        <div className="space-y-2">
           {allTokens.map((token) => (
             <button
               key={token.symbol}
               onClick={() => {
                 setSelectedTokenSymbol(token.symbol);
                 setIsTokenModalOpen(false);
                 setAmount(""); // Reset amount on switch
               }}
               className={cn(
                 "w-full flex items-center gap-4 p-4 rounded-xl transition-all border",
                 selectedTokenSymbol === token.symbol 
                   ? "bg-blue-50 border-blue-200 shadow-sm" 
                   : "bg-white border-transparent hover:bg-slate-50"
               )}
             >
                <div className={cn(
                  "size-10 rounded-full flex items-center justify-center text-black font-bold text-xs",
                  token.symbol === "BNB" ? "bg-[#F0B90B]" : "bg-slate-100"
                )}>
                  {token.symbol === "BNB" ? "BNB" : token.symbol[0]}
                </div>
                <div className="flex-1 text-left">
                   <p className="text-slate-900 font-bold text-sm">{token.name}</p>
                   <p className="text-slate-500 text-xs">{token.symbol}</p>
                </div>
                <div className="text-right">
                   <p className="text-slate-900 font-medium text-sm">{token.balance}</p>
                </div>
                {selectedTokenSymbol === token.symbol && (
                   <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>check_circle</span>
                )}
             </button>
           ))}
        </div>
      </Modal>
    </div>
  );
}
