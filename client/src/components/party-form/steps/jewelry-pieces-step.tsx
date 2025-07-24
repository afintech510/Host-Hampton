import { useState } from "react";
import { UnifiedButton } from "@/components/ui/unified-button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

interface JewelryPiecesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const jewelryPieces = [
  {
    id: "bracelet",
    name: "Bracelet",
    description: "Custom welded bracelet in gold or silver",
    icon: "💫"
  },
  {
    id: "anklet",
    name: "Anklet",
    description: "Delicate ankle chain, perfect for summer",
    icon: "✨"
  },
  {
    id: "necklace",
    name: "Necklace",
    description: "Elegant chain necklace in various lengths",
    icon: "🌟"
  },
  {
    id: "ring",
    name: "Ring",
    description: "Stackable or statement rings",
    icon: "💍"
  }
];

export function JewelryPiecesStep({ formData, updateFormData, onNext, onBack }: JewelryPiecesStepProps) {
  const [selectedPieces, setSelectedPieces] = useState(formData.selectedJewelryPieces || []);

  const handlePieceToggle = (pieceId: string) => {
    setSelectedPieces((prev: string[]) => {
      if (prev.includes(pieceId)) {
        return prev.filter(id => id !== pieceId);
      } else {
        return [...prev, pieceId];
      }
    });
  };

  const handleNext = () => {
    updateFormData({ selectedJewelryPieces: selectedPieces });
    onNext();
  };

  const isValid = selectedPieces.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full mx-auto flex items-center justify-center">
          <div className="text-2xl">💎</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          What pieces are you interested in?
        </h2>
        <p className="text-gray-600">
          Select all the jewelry pieces you'd like for your permanent jewelry experience
        </p>
      </div>

      <div className="space-y-4">
        {jewelryPieces.map((piece, index) => {
          const isSelected = selectedPieces.includes(piece.id);
          
          return (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-pink-300 bg-pink-50 shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-25'
                }`}
                onClick={() => handlePieceToggle(piece.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{piece.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handlePieceToggle(piece.id)}
                          className="data-[state=checked]:bg-pink-400 data-[state=checked]:border-pink-400"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {piece.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {piece.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedPieces.length > 0 && (
        <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
          <p className="font-medium text-pink-800">
            Selected: {selectedPieces.map((id: string) => jewelryPieces.find(p => p.id === id)?.name).join(', ')}
          </p>
        </div>
      )}

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