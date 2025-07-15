import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
          alt="Sarah - Your party planning assistant"
          className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Hey! I'm Sarah.</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          I'm here to help you plan the perfect birthday party at Host Hampton! Let's create something magical together.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={onNext}
          className="w-full bg-coral hover:bg-coral text-white py-4 px-6 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Let's start planning! 🎉
        </Button>
        <Button
          variant="outline"
          className="w-full text-gray-700 py-4 px-6 rounded-2xl text-lg font-medium border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
        >
          I have an existing booking
        </Button>
      </div>
    </div>
  );
}
