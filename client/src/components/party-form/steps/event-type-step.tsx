import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  PartyPopper, 
  HardHat, 
  Gem, 
  Paintbrush, 
  Users, 
  Building, 
  GraduationCap 
} from "lucide-react";

interface EventTypeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const eventTypes = [
  {
    id: "kids-birthday",
    title: "Kids Birthday Party",
    description: "Fun-filled birthday celebrations with themes and activities",
    icon: PartyPopper,
    color: "hsl(15, 85%, 60%)"
  },
  {
    id: "trucker-hat",
    title: "Trucker Hat Bar",
    description: "Custom hat decorating experience for all ages",
    icon: HardHat,
    color: "hsl(155, 40%, 25%)"
  },
  {
    id: "permanent-jewelry",
    title: "Permanent Jewelry",
    description: "Beautiful welded jewelry creation experience",
    icon: Gem,
    color: "hsl(280, 60%, 50%)"
  },
  {
    id: "diy-party",
    title: "DIY Party",
    description: "Hands-on crafting and creative activities",
    icon: Paintbrush,
    color: "hsl(200, 80%, 50%)"
  },
  {
    id: "private-event",
    title: "Private Event",
    description: "Exclusive venue rental for special occasions",
    icon: Users,
    color: "hsl(45, 90%, 55%)"
  },
  {
    id: "studio-rental",
    title: "Partial Studio Rental",
    description: "Rent part of our creative space for your event",
    icon: Building,
    color: "hsl(320, 70%, 55%)"
  },
  {
    id: "workshop",
    title: "Workshop/Class",
    description: "Educational and skill-building experiences",
    icon: GraduationCap,
    color: "hsl(120, 50%, 45%)"
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          What type of event are you planning?
        </h2>
        <p className="text-gray-600">
          Choose the event type that best fits your celebration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {eventTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = selectedEventType === type.id;
          
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-offset-2 shadow-md' 
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  borderColor: isSelected ? type.color : undefined
                }}
                onClick={() => handleEventTypeSelect(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        style={{ color: type.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {type.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {type.description}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'border-transparent' 
                        : 'border-gray-300'
                    }`}
                    style={{
                      backgroundColor: isSelected ? type.color : 'transparent'
                    }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between space-x-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedEventType}
          className="flex-1"
          style={{
            backgroundColor: selectedEventType ? 'hsl(155,40%,25%)' : undefined
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}