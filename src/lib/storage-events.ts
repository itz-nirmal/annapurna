/**
 * Utility functions to handle localStorage updates with custom events
 */

export function setLocalStorageWithEvent(key: string, value: string) {
  localStorage.setItem(key, value);
  
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('localStorageUpdate', {
    detail: { key, value }
  }));
}

export function removeLocalStorageWithEvent(key: string) {
  localStorage.removeItem(key);
  
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('localStorageUpdate', {
    detail: { key, value: null }
  }));
}

export function updateInventoryWithEvent(items: unknown[]) {
  setLocalStorageWithEvent('inventory-items', JSON.stringify(items));
}

export function updateShoppingListWithEvent(items: unknown[]) {
  setLocalStorageWithEvent('shopping-list-items', JSON.stringify(items));
}