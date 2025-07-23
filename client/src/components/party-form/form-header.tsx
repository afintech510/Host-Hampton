import { ChevronLeft, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
  currentStep: number;
  onBack: () => void;
}

export function FormHeader({ currentStep, onBack }: FormHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-md mx-auto px-6 py-4 relative">
        {/* Back button - positioned absolutely on the left */}
        {currentStep > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0 h-auto"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        {/* Centered logo */}
        <div className="flex justify-center">
          <img 
            src="/images/host-hampton-logo.png" 
            alt="Host Hampton" 
            className="h-10 object-contain"
          />
        </div>
        
        {/* Action buttons - positioned absolutely on the right */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 p-0 h-auto"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 p-0 h-auto"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
