"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChefHat, Package, ArrowLeft } from "lucide-react";
import LoadingLink from "@/components/ui/loading-link";
import { ButtonLoading } from "@/components/ui/loading";
import { updateInventoryWithEvent } from "@/lib/storage-events";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export default function AddItemPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [notes, setNotes] = useState("");
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
    };

    getUser();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name.trim() || !category || !quantity || !unit || !expirationDate) {
      setError("All fields are required except notes");
      setLoading(false);
      return;
    }

    try {
      // Create new item
      const newItem = {
        id: Date.now().toString(),
        name: name.trim(),
        category: category || "Uncategorized",
        quantity: quantity || "1",
        unit: unit || "pieces",
        expirationDate,
        notes: notes.trim(),
        addedAt: new Date().toISOString(),
      };

      // Save to localStorage (in a real app, this would be Supabase)
      const existingItems = JSON.parse(
        localStorage.getItem("inventory-items") || "[]"
      );
      const updatedItems = [...existingItems, newItem];
      updateInventoryWithEvent(updatedItems);

      setSuccess("Item added successfully!");

      // Reset form
      setName("");
      setCategory("");
      setQuantity("");
      setUnit("");
      setExpirationDate("");
      setNotes("");

      // Redirect to inventory page after a short delay
      setTimeout(() => {
        router.push("/dashboard/inventory");
      }, 1500);
    } catch {
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-slideInUp">
            <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Add Pantry Item
            </h2>
            <p className="text-gray-300">
              Add a new item to your pantry inventory
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

          <div className="glass-card neon-card-green p-6 rounded-xl animate-scaleIn">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="e.g., Organic Apples"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    placeholder="e.g., 5"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    required
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
                  Expiration Date *
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="Any additional notes about this item..."
                />
              </div>

              <ButtonLoading
                type="submit"
                loading={loading}
                className="w-full btn-premium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 font-medium"
              >
                Add Item to Pantry
              </ButtonLoading>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
