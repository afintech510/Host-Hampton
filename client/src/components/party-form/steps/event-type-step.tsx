import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EventTypeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const eventTypes = [
  {
    id: "kids-birthday",
    title: "Kids Birthday Party"
  },
  {
    id: "trucker-hat",
    title: "Trucker Hat Bar"
  },
  {
    id: "permanent-jewelry",
    title: "Permanent Jewelry"
  },
  {
    id: "diy-party",
    title: "DIY Party"
  },
  {
    id: "private-event",
    title: "Private Event"
  },
  {
    id: "studio-rental",
    title: "Partial Studio Rental"
  },
  {
    id: "workshop",
    title: "Workshop/Class"
  }
];

export function EventTypeStep({ formData, updateFormData, onNext, onBack }: EventTypeStepProps) {
  const selectedEventType = formData.eventType;

  const handleEventTypeSelect = (eventType: string) => {
    updateFormData({ eventType });
  };

  const handleNext = () => {
    if (selectedEventType) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🎉</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          What type of event are you planning?
        </h2>
        <p className="text-gray-600">
          Choose the event type that best fits your celebration
        </p>
      </div>

      <div className="space-y-3">
        {eventTypes.map((type, index) => {
          const isSelected = selectedEventType === type.id;
          
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div 
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-pink-300 bg-pink-50' 
                    : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-25'
                }`}
                onClick={() => handleEventTypeSelect(type.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-pink-400 bg-pink-400' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {type.title}
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex space-x-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedEventType}
          className="flex-1 bg-pink-300 hover:bg-pink-400 text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}