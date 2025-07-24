import { motion } from "framer-motion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onHelpClick?: () => void;
  onContactClick?: () => void;
}

export function ProgressBar({ currentStep, totalSteps, onHelpClick, onContactClick }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white">
      <div className="max-w-md mx-auto px-4 py-2">
        {/* Progress bar matching text margins */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div
            className="bg-dusty-blue h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Help and Contact buttons below progress bar */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={onHelpClick}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 h-auto min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={onContactClick}
            className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 h-auto min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
