"use client";

import { Calculator as CalculatorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalculatorButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CalculatorButton({ 
  onClick, 
  className,
  variant = "ghost",
  size = "sm"
}: CalculatorButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff] transition-colors duration-200",
        className
      )}
      aria-label="Open calculator"
    >
      <CalculatorIcon className="h-4 w-4" />
    </Button>
  );
}
