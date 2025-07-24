import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
  currentStep: number;
  onBack: () => void;
  onClose?: () => void;
}

export function FormHeader({ currentStep, onBack, onClose }: FormHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-md mx-auto px-4 py-4 relative">
        {/* Back button - enlarged for better mobile touch */}
        {currentStep > 1 && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black hover:bg-gray-100 p-3 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
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
        
        {/* Close button - enlarged for better mobile touch */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black hover:bg-gray-100 p-3 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </header>
  );
}
