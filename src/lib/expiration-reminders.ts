interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate: string;
  dateAdded: string;
}

interface ReminderLog {
  itemId: string;
  itemName: string;
  expirationDate: string;
  lastReminderDate: string;
}

const REMINDER_STORAGE_KEY = "annapurna_reminder_log";
const DAYS_BEFORE_EXPIRY = 7;

// Get reminder log from localStorage
function getReminderLog(): ReminderLog[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save reminder log to localStorage
function saveReminderLog(log: ReminderLog[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(log));
}

// Check if we already sent a reminder today for this item
function hasReminderSentToday(itemId: string, expirationDate: string): boolean {
  const log = getReminderLog();
  const today = new Date().toDateString();

  return log.some(
    (entry) =>
      entry.itemId === itemId &&
      entry.expirationDate === expirationDate &&
      new Date(entry.lastReminderDate).toDateString() === today
  );
}

// Log that we sent a reminder
function logReminder(
  itemId: string,
  itemName: string,
  expirationDate: string
): void {
  const log = getReminderLog();
  const existingIndex = log.findIndex(
    (entry) =>
      entry.itemId === itemId && entry.expirationDate === expirationDate
  );

  const reminderEntry: ReminderLog = {
    itemId,
    itemName,
    expirationDate,
    lastReminderDate: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    log[existingIndex] = reminderEntry;
  } else {
    log.push(reminderEntry);
  }

  saveReminderLog(log);
}

// Calculate days until expiration
function getDaysUntilExpiration(expirationDate: string): number {
  const today = new Date();
  const expiry = new Date(expirationDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check if item was recently restocked (added in last 24 hours)
function isRecentlyRestocked(item: InventoryItem): boolean {
  const now = new Date();
  const dateAdded = new Date(item.dateAdded);
  const hoursDiff = (now.getTime() - dateAdded.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 24;
}

// Send expiration reminder notification
async function sendExpirationReminder(
  item: InventoryItem,
  daysLeft: number
): Promise<void> {
  // Request notification permission if not granted
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    const title = `⏰ AnnaPurna Expiration Reminder`;
    const message =
      daysLeft === 0
        ? `${item.name} expires today!`
        : `${item.name} expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`;

    new Notification(title, {
      body: message,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: `expiry-${item.id}`,
      requireInteraction: true,
    });
  }
}

// Main function to check and send expiration reminders
export async function checkExpirationReminders(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Try both storage keys for compatibility
    let inventoryData = localStorage.getItem("inventory-items");
    if (!inventoryData) {
      inventoryData = localStorage.getItem("annapurna_inventory");
    }
    if (!inventoryData) return;

    const inventory: InventoryItem[] = JSON.parse(inventoryData);

    for (const item of inventory) {
      if (!item.expirationDate) continue;

      const daysLeft = getDaysUntilExpiration(item.expirationDate);

      // Check if item is expiring within 7 days (including today)
      if (daysLeft <= DAYS_BEFORE_EXPIRY && daysLeft >= 0) {
        // Skip if recently restocked
        if (isRecentlyRestocked(item)) {
          continue;
        }

        // Skip if we already sent reminder today
        if (hasReminderSentToday(item.id, item.expirationDate)) {
          continue;
        }

        // Send reminder and log it
        await sendExpirationReminder(item, daysLeft);
        logReminder(item.id, item.name, item.expirationDate);
      }
    }
  } catch (error) {
    console.error("Error checking expiration reminders:", error);
  }
}

// Get items expiring soon for UI display
export function getExpiringItems(): InventoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    // Try both storage keys for compatibility
    let inventoryData = localStorage.getItem("inventory-items");
    if (!inventoryData) {
      inventoryData = localStorage.getItem("annapurna_inventory");
    }
    if (!inventoryData) return [];

    const inventory: InventoryItem[] = JSON.parse(inventoryData);

    return inventory
      .filter((item) => {
        if (!item.expirationDate) return false;
        const daysLeft = getDaysUntilExpiration(item.expirationDate);
        return daysLeft <= DAYS_BEFORE_EXPIRY && daysLeft >= 0;
      })
      .sort((a, b) => {
        const daysA = getDaysUntilExpiration(a.expirationDate);
        const daysB = getDaysUntilExpiration(b.expirationDate);
        return daysA - daysB;
      });
  } catch (error) {
    console.error("Error getting expiring items:", error);
    return [];
  }
}

// Clean up old reminder logs (older than 30 days)
export function cleanupReminderLog(): void {
  if (typeof window === "undefined") return;

  const log = getReminderLog();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const cleanedLog = log.filter(
    (entry) => new Date(entry.lastReminderDate) > thirtyDaysAgo
  );

  saveReminderLog(cleanedLog);
}
