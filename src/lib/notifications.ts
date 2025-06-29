// Notification utility for browser notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/logo.png",
      badge: "/logo.png",
      ...options,
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }
  return null;
};

export const showLowStockNotification = (
  itemName: string,
  quantity: string,
  unit: string
) => {
  return showNotification("🔔 Low Stock Alert - AnnaPurna", {
    body: `${itemName} is running low (${quantity} ${unit} remaining). Added to shopping list automatically.`,
    tag: `low-stock-${itemName}`,
    requireInteraction: false,
  });
};
