import { UnifiedButton } from "@/components/ui/unified-button";
import { Link } from "wouter";
import allieImage from "@assets/image_1752579343744.png";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src={allieImage}
          alt="Allie - Your party planning assistant"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Hey! I'm Allie.
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          I'm here to help you plan the perfect birthday party at Host Hampton!
          Let's create something magical together.
        </p>
      </div>

      <div className="space-y-4">
        <UnifiedButton
          onClick={onNext}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Let's start planning! 🎉
        </UnifiedButton>
        <Link href="/my-events">
          <UnifiedButton
            variant="outline"
            size="lg"
            className="w-full"
          >
            I have an existing booking
          </UnifiedButton>
        </Link>
      </div>
    </div>
  );
}
