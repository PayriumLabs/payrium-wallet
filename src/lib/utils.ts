import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// NOTE: Ideally we would use clsx and tailwind-merge. 
// Since they might not be installed, I will provide a robust fallback implementation 
// or I can assume standard setup. 
// Actually, to be safe and "world class", I'll implement a basic version that doesn't crash 
// if packages are missing, BUT the user asked for "Production Ready". 
// A production ready app NEEDS `clsx` and `tailwind-merge`.
// I will start by writing standard shadcn-like utils code. 
// If the user doesn't have them, the build will fail, so I should probably verify dependencies again.
// The user's package.json DID NOT have them. 
// So I will write a pure JS implementation of `cn` to avoid build errors.

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
