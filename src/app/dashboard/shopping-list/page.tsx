"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChefHat,
  ShoppingCart,
  Plus,
  ArrowLeft,
  Trash2,
  Check,
} from "lucide-react";

import LoadingLink from "@/components/ui/loading-link";
import { ButtonLoading } from "@/components/ui/loading";
import { updateShoppingListWithEvent } from "@/lib/storage-events";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  completed: boolean;
  autoAdded?: boolean;
  addedAt?: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export default function ShoppingListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const categories = [
    "Fruits & Vegetables",
    "Meat & Poultry",
    "Dairy & Eggs",
    "Grains & Cereals",
    "Canned Goods",
    "Frozen Foods",
    "Snacks",
    "Beverages",
    "Condiments & Sauces",
    "Baking Supplies",
    "Other",
  ];

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

      // Load shopping list asynchronously for better performance
      setTimeout(() => {
        const savedItems = localStorage.getItem("shopping-list-items");
        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
      }, 0);
    };

    getUser();
  }, [router, supabase.auth]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!newItemName.trim()) {
      setError("Item name is required");
      setLoading(false);
      return;
    }

    try {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity,
        unit: newItemUnit,
        category: newItemCategory,
        completed: false,
      };

      const updatedItems = [...items, newItem];
      setItems(updatedItems);

      // Save to localStorage with event
      updateShoppingListWithEvent(updatedItems);

      setSuccess("Item added to shopping list!");

      // Reset form
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemUnit("");
      setNewItemCategory("");
    } catch {
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemCompleted = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    updateShoppingListWithEvent(updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    updateShoppingListWithEvent(updatedItems);
  };

  const completedItems = items.filter((item) => item.completed);
  const pendingItems = items.filter((item) => !item.completed);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen relative animate-fadeIn">
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slideInUp">
            <ShoppingCart className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Shopping List
            </h2>
            <p className="text-gray-300">
              Manage your shopping list and track your purchases
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Item */}
            <div className="glass-card neon-card-green p-6 rounded-xl animate-slideInLeft">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Item
              </h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    placeholder="e.g., Bananas"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                      placeholder="1"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unit
                    </label>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    >
                      <option value="">Select unit</option>
                      {units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <ButtonLoading
                  type="submit"
                  loading={loading}
                  className="w-full btn-premium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Add to List
                </ButtonLoading>
              </form>
            </div>

            {/* Shopping List */}
            <div className="glass-card neon-card-blue p-6 rounded-xl animate-slideInRight">
              <h3 className="text-xl font-semibold text-white mb-4">
                Your Shopping List ({pendingItems.length} items)
              </h3>

              {pendingItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Your shopping list is empty. Add some items to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        item.autoAdded
                          ? "border-yellow-500/50 bg-yellow-900/10 hover:bg-yellow-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleItemCompleted(item.id)}
                          className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded hover:border-green-500 transition-colors"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            {item.autoAdded && (
                              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                Auto-added
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} {item.unit} • {item.category}
                            {item.autoAdded && item.addedAt && (
                              <span className="ml-2 text-yellow-400">
                                • Low stock detected
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {completedItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Completed ({completedItems.length})
                  </h4>
                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleItemCompleted(item.id)}
                            className="w-5 h-5 bg-green-500 rounded flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </button>
                          <div>
                            <p className="line-through">{item.name}</p>
                            <p className="text-sm">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
