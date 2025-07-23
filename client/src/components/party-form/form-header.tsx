import { ChevronLeft, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormHeaderProps {
  currentStep: number;
  onBack: () => void;
}

export function FormHeader({ currentStep, onBack }: FormHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 p-0 h-auto"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <img 
            src="/attached_assets/host-hampton-logo_1920_1753312301680.png" 
            alt="Host Hampton" 
            className="h-6 object-contain"
          />
        </div>
        <div className="flex items-center space-x-2">
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
