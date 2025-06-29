"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ChefHat,
  Package,
  ShoppingCart,
  Bell,
  Plus,
  Settings,
} from "lucide-react";
import LoadingLink from "@/components/ui/loading-link";
import RecipeChatbot from "@/components/ui/recipe-chatbot";
import {
  checkExpirationReminders,
  getExpiringItems,
} from "@/lib/expiration-reminders";
import { initializeUserData, migrateData } from "@/lib/data-cleanup";
import { ensureCleanStart } from "@/lib/clear-demo-data";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [shoppingListCount, setShoppingListCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);
        
        // Initialize and migrate data, then load counts asynchronously
        setTimeout(() => {
          ensureCleanStart();
          migrateData();
          initializeUserData();
          loadCounts();
        }, 0);
      } catch (error) {
        console.error("Error getting user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase.auth]);

  // Check expiration reminders on component mount and periodically
  useEffect(() => {
    if (user) {
      // Check immediately
      checkExpirationReminders();

      // Set up interval to check every hour
      const interval = setInterval(() => {
        checkExpirationReminders();
      }, 60 * 60 * 1000); // 1 hour

      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for localStorage changes to update counts in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'inventory-items' || e.key === 'shopping-list-items' || e.key === 'annapurna_inventory') {
        loadCounts();
      }
    };

    // Listen for custom storage events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadCounts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);

    // Also refresh counts every 30 seconds to catch expiration changes
    const intervalId = setInterval(() => {
      loadCounts();
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Refresh counts when returning to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCounts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadCounts = () => {
    try {
      // Load inventory data from the correct key
      const inventoryItems = JSON.parse(
        localStorage.getItem("inventory-items") || "[]"
      );
      setInventory(inventoryItems);
      setInventoryCount(inventoryItems.length);

      // Count expiring items (within 7 days using new function)
      const expiringItems = getExpiringItems();
      console.log('Dashboard: Found expiring items:', expiringItems.length, expiringItems);
      setExpiringCount(expiringItems.length);

      // Load shopping list count from the correct key
      const shoppingItems = JSON.parse(
        localStorage.getItem("shopping-list-items") || "[]"
      );
      const pendingItems = shoppingItems.filter(
        (item: { completed: boolean }) => !item.completed
      );
      setShoppingListCount(pendingItems.length);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AnnaPurna
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <LoadingLink
                href="/account"
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.user_metadata?.full_name?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "U"}
                  </span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <Settings className="h-4 w-4 text-gray-400" />
              </LoadingLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back,{" "}
            {user.user_metadata?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening in your pantry today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <LoadingLink
            href="/dashboard/inventory"
            prefetch={true}
            className="glass-card neon-card-blue p-6 rounded-lg hover:scale-105 transition-all duration-300 animate-slideInUp animate-delay-100"
          >
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Items</p>
                <p className="text-2xl font-bold text-white">
                  {inventoryCount}
                </p>
              </div>
            </div>
          </LoadingLink>

          <LoadingLink
            href="/dashboard/inventory"
            prefetch={true}
            className="glass-card neon-card-yellow p-6 rounded-lg hover:scale-105 transition-all duration-300 animate-slideInUp animate-delay-200"
          >
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">
                  Expiring Soon
                </p>
                <p className="text-2xl font-bold text-white">{expiringCount}</p>
              </div>
            </div>
          </LoadingLink>

          <LoadingLink
            href="/dashboard/shopping-list"
            prefetch={true}
            className="glass-card neon-card-green p-6 rounded-lg hover:scale-105 transition-all duration-300 animate-slideInUp animate-delay-300"
          >
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">
                  Shopping List
                </p>
                <p className="text-2xl font-bold text-white">
                  {shoppingListCount}
                </p>
              </div>
            </div>
          </LoadingLink>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card neon-card-green p-6 rounded-lg animate-slideInLeft animate-delay-100">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <LoadingLink
                href="/dashboard/add-item"
                prefetch={true}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Pantry Item
              </LoadingLink>
              <LoadingLink
                href="/dashboard/shopping-list"
                prefetch={true}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Manage Shopping List
              </LoadingLink>
            </div>
          </div>

          <div className="glass-card neon-card-blue p-6 rounded-lg animate-slideInRight animate-delay-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No recent activity yet. Start by adding some items to your
                pantry!
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="glass-card neon-card-purple p-6 rounded-lg animate-scaleIn animate-delay-300">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Getting Started
          </h3>
          <p className="text-green-700 dark:text-green-200 mb-4">
            Welcome to AnnaPurna! To get the most out of your pantry tracker,
            follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-green-700 dark:text-green-200">
            <li>Create or join a household</li>
            <li>Add your first pantry items</li>
            <li>Set up expiration date notifications</li>
            <li>Start building your shopping list</li>
          </ol>
        </div>
      </main>

      {/* AI Recipe Chatbot */}
      <RecipeChatbot inventory={inventory} user={user} />
    </div>
  );
}
