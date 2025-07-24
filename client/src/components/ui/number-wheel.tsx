import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface NumberWheelProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
}

export function NumberWheel({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  className,
  placeholder = "0"
}: NumberWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate numbers for the wheel (limit to reasonable range for mobile)
  const numbers = Array.from({ length: Math.min(max - min + 1, 51) }, (_, i) => min + i);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = useCallback((num: number) => {
    setSelectedValue(num);
    onChange(num);
    setIsOpen(false);
  }, [onChange]);

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  if (!isMobile) {
    // Fallback to regular input on desktop
    return (
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={cn(
          "w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300",
          className
        )}
      />
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 text-left bg-white flex items-center justify-between",
          isOpen && "border-pink-300",
          className
        )}
      >
        <span className={selectedValue === 0 ? "text-gray-400" : "text-gray-900"}>
          {selectedValue || placeholder}
        </span>
        <div className="flex flex-col space-y-0.5">
          <div className="w-0 h-0 border-l-2 border-r-2 border-l-transparent border-r-transparent border-b-2 border-b-gray-400"></div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-l-transparent border-r-transparent border-t-2 border-t-gray-400"></div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:relative md:inset-auto md:bg-transparent md:flex md:items-start">
          <div className="w-full bg-white rounded-t-2xl md:absolute md:top-full md:left-0 md:right-0 md:mt-1 md:rounded-xl md:border md:border-gray-200 md:shadow-lg md:max-h-60">
            {/* Mobile header */}
            <div className="md:hidden p-4 border-b border-gray-200 flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Select Number</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div 
              ref={wheelRef}
              className="overflow-y-auto max-h-80 md:max-h-60 pb-safe"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {numbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSelect(num)}
                  className={cn(
                    "w-full px-6 py-4 md:px-4 md:py-3 text-left hover:bg-pink-50 active:bg-pink-100 transition-colors text-lg border-b border-gray-100 last:border-b-0",
                    selectedValue === num && "bg-pink-100 text-pink-800 font-medium"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}