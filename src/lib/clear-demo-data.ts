/**
 * Clear any demo/sample data that might exist in localStorage
 */

export function clearDemoData() {
  // List of potential demo/sample data keys
  const demoKeys = [
    'demo-inventory',
    'sample-inventory',
    'test-inventory',
    'demo-shopping',
    'sample-shopping',
    'test-shopping',
    'demo-items',
    'sample-items',
    'test-items'
  ];

  // Clear any demo data
  demoKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Removed demo data: ${key}`);
    }
  });

  // Check for any items that might be demo data in the main storage
  const inventoryItems = JSON.parse(localStorage.getItem('inventory-items') || '[]');
  const shoppingItems = JSON.parse(localStorage.getItem('shopping-list-items') || '[]');

  // Remove items that look like demo data (common demo names)
  const demoNames = [
    'sample', 'demo', 'test', 'example', 'placeholder',
    'Sample Apple', 'Demo Bread', 'Test Milk', 'Example Cheese'
  ];

  const cleanInventory = inventoryItems.filter((item: { name?: string }) => {
    const itemName = item.name?.toLowerCase() || '';
    return !demoNames.some(demoName => itemName.includes(demoName.toLowerCase()));
  });

  const cleanShopping = shoppingItems.filter((item: { name?: string }) => {
    const itemName = item.name?.toLowerCase() || '';
    return !demoNames.some(demoName => itemName.includes(demoName.toLowerCase()));
  });

  // Update storage with cleaned data
  if (cleanInventory.length !== inventoryItems.length) {
    localStorage.setItem('inventory-items', JSON.stringify(cleanInventory));
    console.log(`Removed ${inventoryItems.length - cleanInventory.length} demo inventory items`);
  }

  if (cleanShopping.length !== shoppingItems.length) {
    localStorage.setItem('shopping-list-items', JSON.stringify(cleanShopping));
    console.log(`Removed ${shoppingItems.length - cleanShopping.length} demo shopping items`);
  }
}

export function ensureCleanStart() {
  // Clear demo data
  clearDemoData();
  
  // Ensure we have clean empty arrays
  if (!localStorage.getItem('inventory-items')) {
    localStorage.setItem('inventory-items', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('shopping-list-items')) {
    localStorage.setItem('shopping-list-items', JSON.stringify([]));
  }

  console.log('Clean start ensured - no demo data present');
}