"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: "account_balance_wallet",
    title: "Welcome to Payrium",
    description: "Your secure, non-custodial wallet for the BNB Smart Chain. Simple payments, powerful features.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: "lock",
    title: "You Own Your Keys",
    description: "Your private keys never leave your device. Only you have access to your funds.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: "how_to_vote",
    title: "Participate in Governance",
    description: "Hold PUM tokens to vote on proposals and help shape the future of Payrium.",
    color: "from-purple-500 to-purple-600",
  },
];

export default function OnboardPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/onboard/start");
    }
  };

  const handleSkip = () => {
    router.push("/onboard/start");
  };

  const slide = slides[currentSlide];

  return (
    // Enforcing White Background
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Decor - Subtle Light Mode Only */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#60A5FA]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Skip button with explicit slate text */}
      <div className="absolute top-0 right-0 p-6 z-10">
        <button
          onClick={handleSkip}
          className="text-[#64748B] text-sm font-semibold hover:text-[#3B82F6] transition-colors px-4 py-2 rounded-full hover:bg-white"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-8 z-10">
        {/* Illustration Container */}
        <div className="relative mb-12 group">
           <div className={cn(
             "w-40 h-40 rounded-[2rem] bg-gradient-to-br shadow-2xl transition-all duration-500 ease-out flex items-center justify-center transform group-hover:scale-105",
             slide.color,
             "shadow-blue-500/20"
           )}>
             <span
               className="material-symbols-outlined text-white drop-shadow-md transition-all duration-300"
               style={{ fontSize: "72px", fontVariationSettings: "'FILL' 1" }}
             >
               {slide.icon}
             </span>
           </div>
        </div>

        {/* Text - Explicit Hex for high contrast */}
        <div className="text-center space-y-4 mb-12 animate-in-slide-up">
          <h1 key={`title-${currentSlide}`} className="text-3xl font-extrabold tracking-tight text-[#0F172A] transition-all duration-300">
            {slide.title}
          </h1>
          <p key={`desc-${currentSlide}`} className="text-[#64748B] text-lg leading-relaxed max-w-[280px] mx-auto transition-all duration-300">
            {slide.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-3 mb-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-500 ease-out",
                index === currentSlide ? "w-8 bg-[#3B82F6]" : "w-2 bg-[#E2E8F0] hover:bg-[#CBD5E1]"
              )}
            />
          ))}
        </div>
      </div>

      {/* Bottom action */}
      <div className="w-full max-w-md p-8 pt-0 z-10">
        <Button onClick={handleNext} className="w-full h-14 text-lg shadow-xl shadow-blue-500/20" size="lg">
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}
