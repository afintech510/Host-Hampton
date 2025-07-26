import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorkshopDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WorkshopDetailsStep({ formData, updateFormData, onNext, onBack }: WorkshopDetailsStepProps) {
  const [workshopType, setWorkshopType] = useState(formData.workshopType || "");
  const [workshopDescription, setWorkshopDescription] = useState(formData.workshopDescription || "");
  const [expectedAttendees, setExpectedAttendees] = useState(formData.expectedAttendees || "");
  const [classFormat, setClassFormat] = useState(formData.classFormat || "");

  const handleNext = () => {
    updateFormData({ 
      workshopType,
      workshopDescription, 
      expectedAttendees: parseInt(expectedAttendees) || 0,
      classFormat
    });
    onNext();
  };

  const totalAttendees = parseInt(expectedAttendees) || 0;
  const isValid = workshopType && workshopDescription.trim() && expectedAttendees && classFormat;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">🎓</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Tell us about your Workshop
        </h2>
        <p className="text-gray-600">
          Share details about your class or workshop so we can create the perfect learning environment
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Class Format *</Label>
          <RadioGroup value={classFormat} onValueChange={setClassFormat} className="space-y-3">
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="single-class" id="single-class" className="mr-3" />
              <Label htmlFor="single-class" className="text-lg cursor-pointer flex-1">
                One-time class or workshop
              </Label>
            </div>
            <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-200 transition-colors">
              <RadioGroupItem value="series" id="series" className="mr-3" />
              <Label htmlFor="series" className="text-lg cursor-pointer flex-1">
                Series of classes (multiple sessions)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Workshop Type *</Label>
          <Input
            type="text"
            value={workshopType}
            onChange={(e) => setWorkshopType(e.target.value)}
            placeholder="e.g., Art Class, Cooking Workshop, Business Training, etc."
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Workshop Description *</Label>
          <Textarea
            value={workshopDescription}
            onChange={(e) => setWorkshopDescription(e.target.value)}
            placeholder="Describe your workshop - what will participants learn? What activities will you include? Any special requirements?"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300 min-h-[100px] resize-none"
            rows={4}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Expected Attendees *</Label>
          <Input
            type="number"
            value={expectedAttendees}
            onChange={(e) => setExpectedAttendees(e.target.value)}
            placeholder="Number of participants"
            min="1"
            className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-pink-300"
          />
        </div>

        {totalAttendees > 0 && (
          <div className={`p-4 rounded-xl ${totalAttendees > 65 ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm font-medium ${totalAttendees > 65 ? 'text-orange-800' : 'text-green-800'}`}>
              Expected attendees: {totalAttendees}
            </p>
            {totalAttendees > 65 && (
              <p className="text-sm text-orange-700 mt-1">
                Note: For workshops with over 65 participants, please call us to discuss venue options and setup requirements.
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Studio Space:</strong> Our venue is ideal for workshops up to 65 people and includes tables, chairs, and AV equipment.
          </p>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <UnifiedButton 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </UnifiedButton>
        <UnifiedButton 
          onClick={handleNext}
          disabled={!isValid}
          variant="primary"
          className="flex-1"
        >
          Continue
        </UnifiedButton>
      </div>
    </div>
  );
}