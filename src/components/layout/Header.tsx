"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightContent?: React.ReactNode;
  className?: string; // Added className prop
}

export function Header({ 
  title = "Payrium", 
  showBack = false, 
  backHref = "/dashboard",
  rightContent,
  className
}: HeaderProps) {
  return (
    <header className={cn("flex items-center justify-between px-6 py-5 z-10 bg-surface-light/80 backdrop-blur-md sticky top-0", className)}>
      <div className="flex items-center gap-2 text-slate-900">
        {showBack ? (
          <Link
            href={backHref}
            className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition-colors -ml-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              arrow_back
            </span>
          </Link>
        ) : (
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-glow md:hidden">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              account_balance_wallet
            </span>
          </div>
        )}
        <h2 className="text-lg font-bold leading-tight tracking-tight">{title}</h2>
      </div>
      
      {rightContent || (
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center size-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              notifications
            </span>
          </button>
          <Link
            href="/settings"
            className="size-9 rounded-full bg-slate-100 border-2 border-white overflow-hidden relative flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "22px" }}>
              account_circle
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
