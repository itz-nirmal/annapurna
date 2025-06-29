import { showLowStockNotification } from "./notifications";
import { updateShoppingListWithEvent } from "./storage-events";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  expirationDate: string;
  notes: string;
  addedAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  completed: boolean;
  autoAdded?: boolean;
  addedAt?: string;
}

export const checkLowStockAndAddToShopping = (
  inventoryItems: InventoryItem[]
): string[] => {
  const addedItems: string[] = [];
  const lowStockThreshold = 5;

  // Get current shopping list
  const existingShoppingList: ShoppingItem[] = JSON.parse(
    localStorage.getItem("shopping-list-items") || "[]"
  );

  inventoryItems.forEach((item) => {
    const quantity = parseFloat(item.quantity);

    // Check if quantity is 5 or below and item is not already in shopping list
    if (quantity <= lowStockThreshold && quantity > 0) {
      const existsInShopping = existingShoppingList.some(
        (shoppingItem) =>
          shoppingItem.name.toLowerCase() === item.name.toLowerCase()
      );

      if (!existsInShopping) {
        // Add to shopping list
        const newShoppingItem: ShoppingItem = {
          id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          quantity: "1", // Default quantity for shopping
          unit: item.unit,
          category: item.category || "Other",
          completed: false,
          autoAdded: true,
          addedAt: new Date().toISOString(),
        };

        existingShoppingList.push(newShoppingItem);
        addedItems.push(item.name);

        // Show notification
        showLowStockNotification(item.name, item.quantity, item.unit);
      }
    }
  });

  // Save updated shopping list
  if (addedItems.length > 0) {
    updateShoppingListWithEvent(existingShoppingList);
  }

  return addedItems;
};

export const getAutoAddedItemsCount = (): number => {
  const shoppingList: ShoppingItem[] = JSON.parse(
    localStorage.getItem("shopping-list-items") || "[]"
  );

  return shoppingList.filter((item) => item.autoAdded && !item.completed)
    .length;
};
