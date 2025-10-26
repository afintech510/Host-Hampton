import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

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

// Food items with quantity counters
const FOOD_ITEMS = [
  { id: 1001, name: "Fruit Tray", icon: "🍓", price: 35 },
  { id: 1002, name: "Tray of Chicken Fingers", icon: "🍗", price: 50 },
  { id: 1003, name: "Tray of French Fries", icon: "🍟", price: 50 },
  { id: 1004, name: "Regular Pizza (Adults)", icon: "🍕", price: 28 },
  { id: 1005, name: "Specialty Pizza", icon: "🍕", price: 35 },
  { id: 1006, name: "Charcuterie Board", icon: "🧀", price: 75 },
];

// Treats items with quantity counters (per dozen)
const TREATS_ITEMS = [
  { id: 2001, name: "Macarons", icon: "❤️", price: 60 },
  { id: 2002, name: "Chocolate Covered Pretzels", icon: "🥨", price: 45 },
  { id: 2003, name: "Chocolate Covered Rice Krispies", icon: "🍚", price: 40 },
  { id: 2004, name: "Decorated Sugar Cookies", icon: "🍪", price: 48 },
];

// Specialty Items - selectable buttons
const SPECIALTY_ITEMS = [
  { id: 3001, name: "Popcorn Bar", icon: "🍿", price: 150 },
  { id: 3002, name: "Candy Wall", icon: "🍭", price: 200 },
  { id: 3003, name: "Custom Treat Table", icon: "🧁", price: 250 },
];

// Drinks - selectable buttons
const DRINK_ITEMS = [
  { id: 4001, name: "Soda & Seltzers Package", icon: "🥤", price: 50 },
  { id: 4002, name: "Coffee Bar", icon: "☕", price: 75 },
];

// Decor items - selectable buttons
const DECOR_ITEMS = [
  { id: 5001, name: "Balloon Bouquet", icon: "🎈", price: 95 },
  { id: 5002, name: "Balloon Arch", icon: "🎪", price: 195 },
  { id: 5003, name: "Photo Booth", icon: "📸", price: 150 },
  { id: 5004, name: "Confetti Cannons (4)", icon: "🎊", price: 40 },
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
  const getItemQuantity = (itemId: number, list: DIYAddon[]) => {
    return list.filter((item) => item.id === itemId).length;
  };

  const handleQuantityChange = (
    item: any,
    delta: number,
    currentList: DIYAddon[],
    onAdd: (addon: DIYAddon) => void,
    onRemove: (id: number) => void,
  ) => {
    const currentQty = getItemQuantity(item.id, currentList);
    const newQty = currentQty + delta;

    if (newQty < 0) return;

    if (delta > 0) {
      onAdd({
        id: item.id,
        name: item.name,
        price: item.price,
        category: "food",
        icon: item.icon,
      });
    } else if (delta < 0 && currentQty > 0) {
      const itemToRemove = currentList.find((i) => i.id === item.id);
      if (itemToRemove) onRemove(itemToRemove.id);
    }
  };

  const isItemSelected = (itemId: number, list: DIYAddon[]) => {
    return list.some((item) => item.id === itemId);
  };

  const toggleItem = (
    item: any,
    list: DIYAddon[],
    onAdd: (addon: DIYAddon) => void,
    onRemove: (id: number) => void,
    category: string,
  ) => {
    if (isItemSelected(item.id, list)) {
      const itemToRemove = list.find((i) => i.id === item.id);
      if (itemToRemove) onRemove(itemToRemove.id);
    } else {
      onAdd({
        id: item.id,
        name: item.name,
        price: item.price,
        category,
        icon: item.icon,
      });
    }
  };

  return (
    <div className="space-y-6" data-testid="diy-addons-section">
      {/* Decor Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            🎀 Decor Add-ons
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Add decorations to your party
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DECOR_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={
                isItemSelected(item.id, selectedExtras) ? "default" : "outline"
              }
              className={`w-full justify-start h-auto py-3 ${
                isItemSelected(item.id, selectedExtras)
                  ? "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300"
                  : "border-gray-200 hover:border-purple-300"
              }`}
              onClick={() =>
                toggleItem(
                  item,
                  selectedExtras,
                  onAddExtra,
                  onRemoveExtra,
                  "decor",
                )
              }
              data-testid={`decor-item-${item.id}`}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
                {isItemSelected(item.id, selectedExtras) && (
                  <span className="text-sm font-medium">${item.price}</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Food Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Food Add-ons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {FOOD_ITEMS.map((item) => {
            const qty = getItemQuantity(item.id, selectedFood);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                data-testid={`food-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() =>
                      handleQuantityChange(
                        item,
                        -1,
                        selectedFood,
                        onAddFood,
                        onRemoveFood,
                      )
                    }
                    disabled={qty === 0}
                    data-testid={`food-minus-${item.id}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span
                    className="w-8 text-center font-medium"
                    data-testid={`food-qty-${item.id}`}
                  >
                    {qty}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() =>
                      handleQuantityChange(
                        item,
                        1,
                        selectedFood,
                        onAddFood,
                        onRemoveFood,
                      )
                    }
                    data-testid={`food-plus-${item.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Treats Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Add-ons (per dozen):
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TREATS_ITEMS.map((item) => {
            const qty = getItemQuantity(item.id, selectedFood);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                data-testid={`treats-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() =>
                      handleQuantityChange(
                        item,
                        -1,
                        selectedFood,
                        onAddFood,
                        onRemoveFood,
                      )
                    }
                    disabled={qty === 0}
                    data-testid={`treats-minus-${item.id}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span
                    className="w-8 text-center font-medium"
                    data-testid={`treats-qty-${item.id}`}
                  >
                    {qty}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() =>
                      handleQuantityChange(
                        item,
                        1,
                        selectedFood,
                        onAddFood,
                        onRemoveFood,
                      )
                    }
                    data-testid={`treats-plus-${item.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Specialty Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Specialty Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SPECIALTY_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={
                isItemSelected(item.id, selectedExtras) ? "default" : "outline"
              }
              className={`w-full justify-start h-auto py-3 ${
                isItemSelected(item.id, selectedExtras)
                  ? "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300"
                  : "border-gray-200 hover:border-purple-300"
              }`}
              onClick={() =>
                toggleItem(
                  item,
                  selectedExtras,
                  onAddExtra,
                  onRemoveExtra,
                  "specialty",
                )
              }
              data-testid={`specialty-item-${item.id}`}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
                {isItemSelected(item.id, selectedExtras) && (
                  <span className="text-sm font-medium">${item.price}</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Drinks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Add-ons:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DRINK_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={
                isItemSelected(item.id, selectedDrinks) ? "default" : "outline"
              }
              className={`w-full justify-start h-auto py-3 ${
                isItemSelected(item.id, selectedDrinks)
                  ? "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300"
                  : "border-gray-200 hover:border-purple-300"
              }`}
              onClick={() =>
                toggleItem(
                  item,
                  selectedDrinks,
                  onAddDrink,
                  onRemoveDrink,
                  "drink",
                )
              }
              data-testid={`drink-item-${item.id}`}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{item.icon}</span>
                <span className="flex-1 text-left">{item.name}</span>
                {isItemSelected(item.id, selectedDrinks) && (
                  <span className="text-sm font-medium">${item.price}</span>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
