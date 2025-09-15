"use client";

import { useState, useEffect, useCallback } from "react";
import { X, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CalculatorHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculatorHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("calculator-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory).map((item: CalculatorHistory) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsed);
      } catch (error) {
        console.error("Failed to load calculator history:", error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("calculator-history", JSON.stringify(history));
    }
  }, [history]);

  const addToHistory = (expression: string, result: string) => {
    const newEntry: CalculatorHistory = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("calculator-history");
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const expression = `${previousValue} ${operation} ${inputValue}`;
      
      setDisplay(String(newValue));
      addToHistory(expression, String(newValue));
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const { key } = event;
    
    if (key >= "0" && key <= "9") {
      inputNumber(key);
    } else if (key === ".") {
      inputDecimal();
    } else if (key === "+") {
      performOperation("+");
    } else if (key === "-") {
      performOperation("-");
    } else if (key === "*") {
      performOperation("×");
    } else if (key === "/") {
      event.preventDefault();
      performOperation("÷");
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      handleEquals();
    } else if (key === "Escape" || key === "c" || key === "C") {
      clear();
    }
  }, [isOpen, display, previousValue, operation, waitingForOperand]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isOpen, handleKeyPress]);

  const buttonClass = "h-12 text-lg font-medium transition-colors duration-200";
  const numberButtonClass = cn(buttonClass, "bg-white text-[#003366] hover:bg-[#cce0ff] border border-[#cce0ff]");
  const operatorButtonClass = cn(buttonClass, "bg-[#007acc] text-white hover:bg-[#00509e]");
  const functionButtonClass = cn(buttonClass, "bg-[#f8fafc] text-[#00509e] hover:bg-[#cce0ff] border border-[#cce0ff]");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-white rounded-lg shadow-xl corporate-shadow-lg border border-[#cce0ff]">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-[#003366]">
              Calculator
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff]"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-0">
          {/* Display */}
          <div className="mb-4 p-4 bg-[#f8fafc] border border-[#cce0ff] rounded-lg">
            <div className="text-right text-2xl font-mono text-[#003366] min-h-[2rem] flex items-center justify-end">
              {display}
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="mb-4 p-4 bg-[#f8fafc] border border-[#cce0ff] rounded-lg max-h-32 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[#003366]">History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-[#00509e] hover:text-[#003366] hover:bg-[#cce0ff] p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-[#00509e]">No calculations yet</p>
              ) : (
                <div className="space-y-1">
                  {history.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="text-xs text-[#00509e]">
                      <div className="font-mono">{entry.expression} = {entry.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calculator Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Button onClick={clear} className={functionButtonClass}>
              C
            </Button>
            <Button onClick={() => setDisplay(display.slice(0, -1) || "0")} className={functionButtonClass}>
              ⌫
            </Button>
            <Button onClick={() => performOperation("÷")} className={operatorButtonClass}>
              ÷
            </Button>
            <Button onClick={() => performOperation("×")} className={operatorButtonClass}>
              ×
            </Button>

            {/* Row 2 */}
            <Button onClick={() => inputNumber("7")} className={numberButtonClass}>
              7
            </Button>
            <Button onClick={() => inputNumber("8")} className={numberButtonClass}>
              8
            </Button>
            <Button onClick={() => inputNumber("9")} className={numberButtonClass}>
              9
            </Button>
            <Button onClick={() => performOperation("-")} className={operatorButtonClass}>
              -
            </Button>

            {/* Row 3 */}
            <Button onClick={() => inputNumber("4")} className={numberButtonClass}>
              4
            </Button>
            <Button onClick={() => inputNumber("5")} className={numberButtonClass}>
              5
            </Button>
            <Button onClick={() => inputNumber("6")} className={numberButtonClass}>
              6
            </Button>
            <Button onClick={() => performOperation("+")} className={operatorButtonClass}>
              +
            </Button>

            {/* Row 4 */}
            <Button onClick={() => inputNumber("1")} className={numberButtonClass}>
              1
            </Button>
            <Button onClick={() => inputNumber("2")} className={numberButtonClass}>
              2
            </Button>
            <Button onClick={() => inputNumber("3")} className={numberButtonClass}>
              3
            </Button>
            <Button 
              onClick={handleEquals} 
              className={cn(operatorButtonClass, "row-span-2")}
            >
              =
            </Button>

            {/* Row 5 */}
            <Button onClick={() => inputNumber("0")} className={cn(numberButtonClass, "col-span-2")}>
              0
            </Button>
            <Button onClick={inputDecimal} className={numberButtonClass}>
              .
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
