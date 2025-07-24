import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NumberWheelProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function NumberWheel({ value, onValueChange, options, placeholder, className }: NumberWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && selectedRef.current && wheelRef.current) {
      // Center the selected item
      const wheelHeight = wheelRef.current.clientHeight;
      const itemHeight = 48; // Height of each item
      const selectedIndex = options.findIndex(opt => opt.value === value);
      if (selectedIndex >= 0) {
        const scrollTop = selectedIndex * itemHeight - (wheelHeight / 2) + (itemHeight / 2);
        wheelRef.current.scrollTop = scrollTop;
      }
    }
  }, [isOpen, value, options]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-coral text-left flex items-center justify-between",
          !selectedOption && "text-gray-400",
          className
        )}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
            <div 
              ref={wheelRef}
              className="overflow-y-auto scroll-smooth"
              style={{ maxHeight: '240px' }}
            >
              {options.map((option, index) => (
                <div
                  key={option.value}
                  ref={option.value === value ? selectedRef : null}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "p-3 text-center cursor-pointer transition-colors h-12 flex items-center justify-center border-b border-gray-100 last:border-b-0",
                    option.value === value 
                      ? "bg-coral text-white font-medium" 
                      : "hover:bg-gray-50"
                  )}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}