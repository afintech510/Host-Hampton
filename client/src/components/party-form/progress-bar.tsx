import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-white">
      <div className="max-w-md mx-auto px-4 py-2">
        {/* Progress bar matching text margins */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-dusty-blue h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
