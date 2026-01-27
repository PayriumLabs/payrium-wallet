"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasStoredWallet } from "@/lib/wallet";
import { LoadingOverlay } from "@/components/ui";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if wallet exists
    const hasWallet = hasStoredWallet();
    
    if (hasWallet) {
      // Redirect to unlock page
      router.replace("/unlock");
    } else {
      // Redirect to onboarding
      router.replace("/onboard");
    }
  }, [router]);

  if (isChecking) {
    return <LoadingOverlay message="Loading Payrium..." />;
  }

  return null;
}
