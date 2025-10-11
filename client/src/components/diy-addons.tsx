import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

export interface DIYAddon {
  id: number;
  name: string;
  price: number;
  category: string;
  icon?: string;
  perGuest?: boolean;
}

interface DIYAddonsProps {
  selectedFood: DIYAddon[];
  selectedDrinks: DIYAddon[];
  selectedExtras: DIYAddon[];
  onAddFood: (addon: DIYAddon) => void;
  onRemoveFood: (addonId: number) => void;
  onAddDrink: (addon: DIYAddon) => void;
  onRemoveDrink: (addonId: number) => void;
  onAddExtra: (addon: DIYAddon) => void;
  onRemoveExtra: (addonId: number) => void;
  onUpdateGoodieBagQuantity: (quantity: number) => void;
  onUpdatePremiumGoodieBagQuantity: (quantity: number) => void;
  onUpdateBirthdayGiftBasket: (hasBasket: boolean) => void;
  goodieBagQuantity: number;
  premiumGoodieBagQuantity: number;
  hasBirthdayGiftBasket: boolean;
}

const DIY_FOOD_ADDONS: DIYAddon[] = [
  { id: 1001, name: "Pizza Pies", price: 28, category: "food", icon: "🍕" },
  { id: 1002, name: "French Fries", price: 50, category: "food", icon: "🍟" },
  { id: 1003, name: "Chicken Fingers", price: 50, category: "food", icon: "🍗" },
  { id: 1004, name: "Bagels", price: 30, category: "food", icon: "🥯" },
  { id: 1005, name: "Fruit Platter", price: 35, category: "food", icon: "🍇" },
  { id: 1006, name: "Veggie Platter", price: 35, category: "food", icon: "🥕" },
  { id: 1007, name: "Cupcakes (12)", price: 48, category: "food", icon: "🧁" },
  { id: 1008, name: "Macarons (12)", price: 60, category: "food", icon: "🍪" },
  { id: 1009, name: "Candy Wall", price: 200, category: "food", icon: "🍬" },
  { id: 1010, name: "Charcuterie Board", price: 75, category: "food", icon: "🧀" },
];

const DIY_DRINK_ADDONS: DIYAddon[] = [
  { id: 2001, name: "Juice Boxes (12)", price: 15, category: "drink", icon: "🧃" },
  { id: 2002, name: "Water Bottles (12)", price: 12, category: "drink", icon: "💧" },
  { id: 2003, name: "Soda Bottles (6)", price: 18, category: "drink", icon: "🥤" },
  { id: 2004, name: "Coffee Bar", price: 75, category: "drink", icon: "☕" },
];

const DIY_EXTRA_ADDONS: DIYAddon[] = [
  { id: 3001, name: "Balloon Bouquet", price: 95, category: "extra", icon: "🎈" },
  { id: 3002, name: "Balloon Arch", price: 195, category: "extra", icon: "🎪" },
  { id: 3003, name: "Photo Booth", price: 150, category: "extra", icon: "📸" },
  { id: 3004, name: "Confetti Cannons (4)", price: 40, category: "extra", icon: "🎊" },
];

export function DIYAddons({
  selectedFood,
  selectedDrinks,
  selectedExtras,
  onAddFood,
  onRemoveFood,
  onAddDrink,
  onRemoveDrink,
  onAddExtra,
  onRemoveExtra,
  onUpdateGoodieBagQuantity,
  onUpdatePremiumGoodieBagQuantity,
  onUpdateBirthdayGiftBasket,
  goodieBagQuantity,
  premiumGoodieBagQuantity,
  hasBirthdayGiftBasket,
}: DIYAddonsProps) {
  return (
    <div className="space-y-6" data-testid="diy-addons-section">
      {/* Food Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🍕 Food & Sweets
          </CardTitle>
          <CardDescription>
            Add food items to your DIY party
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedFood.length > 0 && (
            <div className="space-y-2">
              {selectedFood.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`selected-food-${addon.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addon.icon}</span>
                    <span className="font-medium">{addon.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">${addon.price}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFood(addon.id)}
                      data-testid={`remove-food-${addon.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Select onValueChange={(value) => {
            const addon = DIY_FOOD_ADDONS.find(a => a.id.toString() === value);
            if (addon && !selectedFood.find(f => f.id === addon.id)) {
              onAddFood(addon);
            }
          }}>
            <SelectTrigger data-testid="select-food-addon">
              <SelectValue placeholder="Add food item..." />
            </SelectTrigger>
            <SelectContent>
              {DIY_FOOD_ADDONS.filter(addon => !selectedFood.find(f => f.id === addon.id)).map((addon) => (
                <SelectItem key={addon.id} value={addon.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{addon.icon}</span>
                    <span>{addon.name}</span>
                    <span className="text-muted-foreground ml-2">${addon.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Drinks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🥤 Drinks
          </CardTitle>
          <CardDescription>
            Add beverages to your DIY party
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDrinks.length > 0 && (
            <div className="space-y-2">
              {selectedDrinks.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`selected-drink-${addon.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addon.icon}</span>
                    <span className="font-medium">{addon.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">${addon.price}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDrink(addon.id)}
                      data-testid={`remove-drink-${addon.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Select onValueChange={(value) => {
            const addon = DIY_DRINK_ADDONS.find(a => a.id.toString() === value);
            if (addon && !selectedDrinks.find(d => d.id === addon.id)) {
              onAddDrink(addon);
            }
          }}>
            <SelectTrigger data-testid="select-drink-addon">
              <SelectValue placeholder="Add drink..." />
            </SelectTrigger>
            <SelectContent>
              {DIY_DRINK_ADDONS.filter(addon => !selectedDrinks.find(d => d.id === addon.id)).map((addon) => (
                <SelectItem key={addon.id} value={addon.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{addon.icon}</span>
                    <span>{addon.name}</span>
                    <span className="text-muted-foreground ml-2">${addon.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Party Extras Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎁 Party Extras
          </CardTitle>
          <CardDescription>
            Add decorations and party favors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedExtras.length > 0 && (
            <div className="space-y-2">
              {selectedExtras.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  data-testid={`selected-extra-${addon.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addon.icon}</span>
                    <span className="font-medium">{addon.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">${addon.price}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveExtra(addon.id)}
                      data-testid={`remove-extra-${addon.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Select onValueChange={(value) => {
            const addon = DIY_EXTRA_ADDONS.find(a => a.id.toString() === value);
            if (addon && !selectedExtras.find(e => e.id === addon.id)) {
              onAddExtra(addon);
            }
          }}>
            <SelectTrigger data-testid="select-extra-addon">
              <SelectValue placeholder="Add party extra..." />
            </SelectTrigger>
            <SelectContent>
              {DIY_EXTRA_ADDONS.filter(addon => !selectedExtras.find(e => e.id === addon.id)).map((addon) => (
                <SelectItem key={addon.id} value={addon.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{addon.icon}</span>
                    <span>{addon.name}</span>
                    <span className="text-muted-foreground ml-2">${addon.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="border-t pt-4 mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Goodie Bags ($8 per bag)</label>
              <Select
                value={goodieBagQuantity.toString()}
                onValueChange={(value) => onUpdateGoodieBagQuantity(parseInt(value))}
              >
                <SelectTrigger data-testid="select-goodie-bags">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 21 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i === 0 ? "None" : `${i} bag${i > 1 ? 's' : ''} - $${i * 8}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Premium Goodie Bags ($15 per bag)</label>
              <Select
                value={premiumGoodieBagQuantity.toString()}
                onValueChange={(value) => onUpdatePremiumGoodieBagQuantity(parseInt(value))}
              >
                <SelectTrigger data-testid="select-premium-goodie-bags">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 21 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i === 0 ? "None" : `${i} bag${i > 1 ? 's' : ''} - $${i * 15}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Birthday Gift Basket ($25)</label>
              <Select
                value={hasBirthdayGiftBasket ? "1" : "0"}
                onValueChange={(value) => onUpdateBirthdayGiftBasket(value === "1")}
              >
                <SelectTrigger data-testid="select-birthday-gift-basket">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No</SelectItem>
                  <SelectItem value="1">Yes - $25</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
