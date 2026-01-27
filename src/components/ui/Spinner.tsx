"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeStyles = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
  };

  return (
    <span
      className={`material-symbols-outlined animate-spin text-primary ${sizeStyles[size]} ${className}`}
      style={{ fontSize: size === "sm" ? "16px" : size === "md" ? "24px" : "32px" }}
    >
      progress_activity
    </span>
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background-light/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-600 font-medium">{message}</p>
    </div>
  );
}

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const baseStyles = "bg-slate-200 animate-pulse";

  const variantStyles = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rect: "rounded-xl",
  };

  return <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} />;
}

// Token skeleton
export function TokenSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="size-10" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
    </div>
  );
}
