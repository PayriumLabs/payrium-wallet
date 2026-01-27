import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center size-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20">
        <span className="material-symbols-outlined text-white text-[20px]">
          account_balance_wallet
        </span>
      </div>
      {showText && (
        <span className="text-xl font-bold text-slate-900 tracking-tight">
          Payrium
        </span>
      )}
    </div>
  );
}
