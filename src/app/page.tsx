import LoadingLink from "@/components/ui/loading-link";
import { ChefHat, Package, ShoppingCart, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">AnnaPurna</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LoadingLink
              href="/login"
              prefetch={true}
              className="px-4 py-2 text-green-300 hover:text-green-200 font-medium transition-all duration-200 hover:scale-105"
            >
              Login
            </LoadingLink>
            <LoadingLink
              href="/signup"
              prefetch={true}
              className="px-4 py-2 btn-premium rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Sign Up
            </LoadingLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Your Smart Pantry Tracker
          </h2>
          <p className="text-xl text-gray-200 mb-8 drop-shadow-md">
            Track your pantry inventory, monitor expiration dates, and reduce
            food waste with AnnaPurna - the intelligent pantry management system
            for modern households.
          </p>
          <div className="flex justify-center mb-12">
            <LoadingLink
              href="/signup"
              prefetch={true}
              className="px-8 py-3 btn-premium rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
            </LoadingLink>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass-card neon-card-green p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slideInUp animate-delay-100">
            <Package className="h-12 w-12 text-green-400 mb-4 transition-transform duration-300 hover:scale-110" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Inventory
            </h3>
            <p className="text-gray-200">
              Track all your pantry items with expiration dates, quantities, and
              categories. Never lose track of what you have at home.
            </p>
          </div>

          <div className="glass-card neon-card-blue p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slideInUp animate-delay-200">
            <Bell className="h-12 w-12 text-blue-400 mb-4 transition-transform duration-300 hover:scale-110" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Alerts
            </h3>
            <p className="text-gray-200">
              Get notified before items expire and when you&apos;re running low
              on essentials. Reduce waste and save money.
            </p>
          </div>

          <div className="glass-card neon-card-purple p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slideInUp animate-delay-300">
            <ShoppingCart className="h-12 w-12 text-purple-400 mb-4 transition-transform duration-300 hover:scale-110" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Shopping Lists
            </h3>
            <p className="text-gray-200">
              Auto-generate shopping lists from low-stock items. Share lists
              with household members for seamless coordination.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 AnnaPurna. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
