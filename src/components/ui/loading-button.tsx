"use client";
import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn("relative", className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText || "Loading..."}
        </span>
      )}
      <span className={cn(isLoading ? "invisible" : "")}>{children}</span>
    </Button>
  );
}
