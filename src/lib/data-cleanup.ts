/**
 * Utility functions to manage and clean up application data
 */

export function clearAllUserData() {
  // Clear all localStorage data related to the app
  const keysToRemove = [
    'inventory-items',
    'shopping-list-items',
    'annapurna_inventory',
    'annapurna_shopping_list'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Clear all chatbot related data
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('chatbot-messages-') || key.startsWith('chatbot-welcome-shown-')) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.startsWith('chatbot-welcome-shown-')) {
      sessionStorage.removeItem(key);
    }
  });

  console.log('All user data cleared successfully');
}

export function initializeUserData() {
  // Ensure empty arrays for inventory and shopping list if they don't exist
  if (!localStorage.getItem('inventory-items')) {
    localStorage.setItem('inventory-items', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('shopping-list-items')) {
    localStorage.setItem('shopping-list-items', JSON.stringify([]));
  }

  if (!localStorage.getItem('annapurna_inventory')) {
    localStorage.setItem('annapurna_inventory', JSON.stringify([]));
  }

  if (!localStorage.getItem('annapurna_shopping_list')) {
    localStorage.setItem('annapurna_shopping_list', JSON.stringify([]));
  }
}

export function getUserDataStats() {
  const inventoryItems = JSON.parse(localStorage.getItem('inventory-items') || '[]');
  const shoppingItems = JSON.parse(localStorage.getItem('shopping-list-items') || '[]');
  const annapurnaInventory = JSON.parse(localStorage.getItem('annapurna_inventory') || '[]');
  
  return {
    inventoryCount: inventoryItems.length,
    shoppingListCount: shoppingItems.length,
    annapurnaInventoryCount: annapurnaInventory.length,
    totalItems: inventoryItems.length + shoppingItems.length + annapurnaInventory.length
  };
}

export function migrateData() {
  // Migrate from old annapurna_inventory to inventory-items if needed
  const oldInventory = localStorage.getItem('annapurna_inventory');
  const newInventory = localStorage.getItem('inventory-items');
  
  if (oldInventory && !newInventory) {
    localStorage.setItem('inventory-items', oldInventory);
    console.log('Migrated inventory data to new format');
  }
  
  // Migrate from old annapurna_shopping_list to shopping-list-items if needed
  const oldShoppingList = localStorage.getItem('annapurna_shopping_list');
  const newShoppingList = localStorage.getItem('shopping-list-items');
  
  if (oldShoppingList && !newShoppingList) {
    localStorage.setItem('shopping-list-items', oldShoppingList);
    console.log('Migrated shopping list data to new format');
  }
}