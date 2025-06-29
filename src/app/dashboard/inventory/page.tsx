"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChefHat,
  Package,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Bell,
  ShoppingCart,
} from "lucide-react";
import LoadingLink from "@/components/ui/loading-link";
import { ButtonLoading } from "@/components/ui/loading";
import { requestNotificationPermission } from "@/lib/notifications";
import {
  checkLowStockAndAddToShopping,
  getAutoAddedItemsCount,
} from "@/lib/auto-shopping";
import { updateInventoryWithEvent } from "@/lib/storage-events";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  expirationDate: string;
  notes: string;
  addedAt: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export default function InventoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [autoAddedCount, setAutoAddedCount] = useState(0);
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const units = [
    "pieces",
    "kg",
    "g",
    "lbs",
    "oz",
    "liters",
    "ml",
    "cups",
    "tbsp",
    "tsp",
    "cans",
    "bottles",
    "packages",
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      
      // Load inventory asynchronously for better performance
      setTimeout(() => {
        loadInventoryItems();
      }, 0);
    };

    getUser();
  }, [router, supabase.auth]);

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Check for low stock items and update auto-added count
  useEffect(() => {
    if (items.length > 0) {
      const addedItems = checkLowStockAndAddToShopping(items);
      if (addedItems.length > 0) {
        setRecentlyAdded(addedItems);
        // Clear the notification after 10 seconds
        setTimeout(() => setRecentlyAdded([]), 10000);
      }
      setAutoAddedCount(getAutoAddedItemsCount());
    }
  }, [items]);

  const loadInventoryItems = () => {
    // Load from localStorage for now (in a real app, this would be from Supabase)
    const savedItems = localStorage.getItem("inventory-items");
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    setLoading(false);
  };

  const deleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    updateInventoryWithEvent(updatedItems);
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item.id);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditQuantity("");
    setEditUnit("");
  };

  const saveEdit = async (id: string) => {
    if (!editQuantity.trim()) {
      return;
    }

    setUpdateLoading(true);

    const updatedItems = items.map((item) =>
      item.id === id
        ? { ...item, quantity: editQuantity, unit: editUnit }
        : item
    );

    setItems(updatedItems);
    updateInventoryWithEvent(updatedItems);

    setEditingItem(null);
    setEditQuantity("");
    setEditUnit("");
    setUpdateLoading(false);

    // Check for low stock after editing
    setTimeout(() => {
      const addedItems = checkLowStockAndAddToShopping([
        updatedItems.find((item) => item.id === id)!,
      ]);
      if (addedItems.length > 0) {
        setRecentlyAdded(addedItems);
        setTimeout(() => setRecentlyAdded([]), 10000);
      }
      setAutoAddedCount(getAutoAddedItemsCount());
    }, 100);
  };

  const getExpiryStatus = (expirationDate: string) => {
    if (!expirationDate) return "unknown";

    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "expired";
    if (diffDays <= 3) return "warning";
    return "fresh";
  };

  const getExpiryColor = (status: string) => {
    switch (status) {
      case "expired":
        return "text-red-400 bg-red-900/20 border-red-500/30";
      case "warning":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-500/30";
      case "fresh":
        return "text-green-400 bg-green-900/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-500/30";
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LoadingLink
              href="/dashboard"
              className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </LoadingLink>
          </div>
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">AnnaPurna</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Pantry Inventory
              </h2>
              <p className="text-gray-300">
                Manage your pantry items and track expiration dates
              </p>
            </div>
            <div className="flex space-x-4">
              <LoadingLink
                href="/dashboard/shopping-list"
                className="relative btn-secondary px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Shopping List</span>
                {autoAddedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                    {autoAddedCount}
                  </span>
                )}
              </LoadingLink>
              <LoadingLink
                href="/dashboard/add-item"
                className="btn-premium px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Item</span>
              </LoadingLink>
            </div>
          </div>

          {/* Low Stock Notification */}
          {recentlyAdded.length > 0 && (
            <div className="mb-6 glass-card neon-card-yellow p-4 rounded-xl animate-slideInUp">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-yellow-400 animate-pulse" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Low Stock Alert!
                  </h3>
                  <p className="text-gray-300">
                    {recentlyAdded.length === 1
                      ? `${recentlyAdded[0]} has been automatically added to your shopping list.`
                      : `${
                          recentlyAdded.length
                        } items have been automatically added to your shopping list: ${recentlyAdded.join(
                          ", "
                        )}.`}
                  </p>
                </div>
                <LoadingLink
                  href="/dashboard/shopping-list"
                  className="btn-secondary px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105"
                >
                  View List
                </LoadingLink>
              </div>
            </div>
          )}

          {loading ? (
            <div className="glass-card neon-card-green p-8 rounded-xl text-center animate-scaleIn">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-300">Loading inventory...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="glass-card neon-card-blue p-8 rounded-xl text-center animate-scaleIn">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No items in your pantry
              </h3>
              <p className="text-gray-300 mb-6">
                Start by adding some items to track your inventory
              </p>
              <LoadingLink
                href="/dashboard/add-item"
                className="btn-premium px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Item</span>
              </LoadingLink>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item, index) => {
                const expiryStatus = getExpiryStatus(item.expirationDate);
                const expiryColor = getExpiryColor(expiryStatus);
                const neonClass =
                  expiryStatus === "expired"
                    ? "neon-card-yellow"
                    : expiryStatus === "warning"
                    ? "neon-card-yellow"
                    : "neon-card-green";

                return (
                  <div
                    key={item.id}
                    className={`glass-card ${neonClass} p-6 rounded-xl animate-slideInUp`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {item.name}
                          </h3>
                          {item.expirationDate && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs border ${expiryColor}`}
                            >
                              {expiryStatus === "expired"
                                ? "Expired"
                                : expiryStatus === "warning"
                                ? "Expires Soon"
                                : "Fresh"}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                          <div>
                            <span className="text-gray-400">Category:</span>
                            <p className="text-white">
                              {item.category || "Uncategorized"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Quantity:</span>
                            {editingItem === item.id ? (
                              <div className="flex space-x-2 mt-1">
                                <input
                                  type="number"
                                  value={editQuantity}
                                  onChange={(e) =>
                                    setEditQuantity(e.target.value)
                                  }
                                  className="w-20 px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                  min="0"
                                  step="0.1"
                                  placeholder="Qty"
                                />
                                <select
                                  value={editUnit}
                                  onChange={(e) => setEditUnit(e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                  title="Select unit"
                                >
                                  {units.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <p className="text-white">
                                {item.quantity} {item.unit}
                              </p>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-400">Expires:</span>
                            <p className="text-white">
                              {item.expirationDate
                                ? new Date(
                                    item.expirationDate
                                  ).toLocaleDateString()
                                : "Not set"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Added:</span>
                            <p className="text-white">
                              {new Date(item.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {item.notes && (
                          <div className="mt-3">
                            <span className="text-gray-400 text-sm">
                              Notes:
                            </span>
                            <p className="text-gray-300 text-sm">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {editingItem === item.id ? (
                          <>
                            <ButtonLoading
                              onClick={() => saveEdit(item.id)}
                              loading={updateLoading}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Save changes"
                            >
                              <Check className="h-4 w-4" />
                            </ButtonLoading>
                            <button
                              onClick={cancelEdit}
                              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-900/20 rounded-lg transition-colors"
                              title="Cancel edit"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit quantity"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
