import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceFormData } from "@/pages/invoice";
import { AlertCircle, Star } from "lucide-react";

interface ActivitiesStepProps {
  formData: InvoiceFormData;
  updateFormData: (updates: Partial<InvoiceFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  addons: any[];
}

export default function ActivitiesStep({ formData, updateFormData, onNext, onPrev, addons }: ActivitiesStepProps) {
  const standardActivities = addons.filter(addon => 
    addon.category === 'activity' && addon.per_guest && addon.price === 1000
  );
  
  const premiumActivities = addons.filter(addon => 
    addon.category === 'activity' && addon.per_guest && addon.price === 2000
  );
  
  const entertainmentOptions = addons.filter(addon => 
    addon.category === 'entertainment'
  );

  // Activity selection logic based on package level
  const getActivityRules = () => {
    const totalStandard = formData.standardActivities.length;
    const totalPremium = formData.premiumActivities.length;
    const totalSelected = totalStandard + totalPremium;
    
    return {
      minRequired: 2,
      canUpgrade: formData.packageLevel >= 2,
      validSelection: 
        (totalPremium >= 1 && totalStandard >= 1) || // 1 premium + 1+ standard
        (totalStandard >= 3 && totalPremium === 0), // OR 3+ standard
      needsSelection: totalSelected < 2
    };
  };

  const rules = getActivityRules();

  const handleStandardActivityChange = (activityId: number, checked: boolean) => {
    const newStandard = checked 
      ? [...formData.standardActivities, activityId]
      : formData.standardActivities.filter(id => id !== activityId);
    
    updateFormData({ standardActivities: newStandard });
  };

  const handlePremiumActivityChange = (activityId: number, checked: boolean) => {
    const newPremium = checked 
      ? [...formData.premiumActivities, activityId]
      : formData.premiumActivities.filter(id => id !== activityId);
    
    updateFormData({ premiumActivities: newPremium });
  };

  const handleEntertainmentChange = (entertainmentId: number, checked: boolean) => {
    const newEntertainment = checked 
      ? [...formData.entertainment, entertainmentId]
      : formData.entertainment.filter(id => id !== entertainmentId);
    
    updateFormData({ entertainment: newEntertainment });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Activities
        </h2>
        <p className="text-gray-600">
          All parties include at least two activities
        </p>
      </div>

      {/* Activity Rules */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Activity Requirements</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Minimum 2 activities required: <strong>1 Premium + 1 Standard</strong> OR <strong>3 Standard</strong></div>
                {formData.packageLevel >= 2 && (
                  <div>• Your Level {formData.packageLevel} package includes activity upgrade allowances</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standard Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 Standard Activities
            <Badge variant="secondary">$10 per person</Badge>
          </CardTitle>
          <CardDescription>
            Choose from our popular activity options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standardActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <Checkbox
                  id={`standard-${activity.id}`}
                  checked={formData.standardActivities.includes(activity.id)}
                  onCheckedChange={(checked) => handleStandardActivityChange(activity.id, !!checked)}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`standard-${activity.id}`}
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {activity.icon} {activity.name}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⭐ Premium Activities
            <Badge className="bg-purple-100 text-purple-800">$20 per person</Badge>
            {formData.packageLevel >= 2 && (
              <Badge className="bg-green-100 text-green-800">
                Upgrade Available
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Enhanced activities with premium materials and experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-purple-50"
              >
                <Checkbox
                  id={`premium-${activity.id}`}
                  checked={formData.premiumActivities.includes(activity.id)}
                  onCheckedChange={(checked) => handlePremiumActivityChange(activity.id, !!checked)}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`premium-${activity.id}`}
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Star className="w-3 h-3 text-purple-600" />
                    {activity.icon} {activity.name}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entertainment Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎭 Professional Entertainment
            <Badge variant="outline">Optional Add-ons</Badge>
          </CardTitle>
          <CardDescription>
            Professional entertainers to make your party extra special
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entertainmentOptions.map((entertainment) => (
              <div 
                key={entertainment.id}
                className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:border-orange-300"
              >
                <Checkbox
                  id={`entertainment-${entertainment.id}`}
                  checked={formData.entertainment.includes(entertainment.id)}
                  onCheckedChange={(checked) => handleEntertainmentChange(entertainment.id, !!checked)}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`entertainment-${entertainment.id}`}
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {entertainment.icon} {entertainment.name}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">{entertainment.description}</p>
                  <div className="text-lg font-bold text-orange-600 mt-1">
                    ${(entertainment.price / 100).toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Message */}
      {rules.needsSelection && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Please select at least 2 activities to continue
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="px-6 py-3"
        >
          ← Back to Package
        </Button>
        <Button 
          onClick={onNext}
          disabled={!rules.validSelection}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
        >
          Continue to Food & Desserts →
        </Button>
      </div>
    </div>
  );
}