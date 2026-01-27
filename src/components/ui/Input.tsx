import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
            error && "border-error focus-visible:ring-error/20",
            rightIcon ? "pr-12" : null,
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

export interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PinInput({ 
  value, 
  onChange, 
  length = 6, 
  error, 
  disabled,
  autoFocus
}: PinInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (autoFocus) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, length);
    onChange(newValue);
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex gap-3 items-center justify-center cursor-text transition-opacity",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        autoComplete="off"
      />
      {Array.from({ length }).map((_, i) => {
        const isFilled = i < value.length;
        const isActive = i === value.length && isFocused;
        // If filled, we show filled style. 
        // If active (next to type) and focused, we show active style.
        
        return (
          <div
            key={i}
            className={cn(
              "w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-200",
              isFilled 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-slate-200 bg-white text-slate-900",
              isActive && "border-primary ring-4 ring-primary/20 scale-110 z-10",
              error && "border-red-500 text-red-500 bg-red-50",
              disabled && "opacity-50"
            )}
          >
            {isFilled ? "•" : ""}
          </div>
        );
      })}
    </div>
  );
}
