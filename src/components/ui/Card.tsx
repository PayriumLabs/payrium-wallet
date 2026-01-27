import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-surface rounded-2xl border border-border/50 text-foreground shadow-sm transition-all hover:shadow-md",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

interface TokenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  priceChange?: number;
  iconColor?: string;
}

export function TokenCard({ symbol, name, balance, usdValue, priceChange, iconColor = "#3B82F6", className, ...props }: TokenCardProps) {
  return (
    <div 
      className={cn(
        "group flex items-center justify-between p-4 rounded-2xl bg-white border border-border/40 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-white font-bold text-xs"
          style={{ backgroundColor: iconColor }}
        >
          {symbol[0]}
        </div>
        
        {/* Name/Symbol */}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{symbol}</span>
          <span className="text-xs text-muted-foreground font-medium">{name}</span>
        </div>
      </div>

      {/* Balance/Value */}
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-foreground">{balance}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">
            ≈ ${usdValue}
          </span>
          {priceChange !== undefined && (
            <span 
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full", 
                priceChange >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}
            >
              {priceChange >= 0 ? "+" : ""}{priceChange}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
