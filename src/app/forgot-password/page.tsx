"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChefHat, Mail, ArrowLeft } from "lucide-react";
import { ButtonLoading } from "@/components/ui/loading";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent! Check your inbox for further instructions.");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fadeIn relative">
      {/* Dark mode pattern overlay */}
      <div className="absolute inset-0 dark:opacity-20 opacity-0 transition-opacity duration-300">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 25%, rgba(34, 197, 94, 0.1) 25%, rgba(34, 197, 94, 0.1) 50%, transparent 50%, transparent 75%, rgba(34, 197, 94, 0.1) 75%),
              linear-gradient(-45deg, transparent 25%, rgba(34, 197, 94, 0.1) 25%, rgba(34, 197, 94, 0.1) 50%, transparent 50%, transparent 75%, rgba(34, 197, 94, 0.1) 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
      </div>

      {/* Fade out overlay for dark mode */}
      <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/80 pointer-events-none" />

      <div className="max-w-md w-full space-y-8 animate-slideInLeft relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-between items-start mb-8">
            <Link
              href="/login"
              className="flex items-center space-x-2 text-blue-600 dark:text-green-400 hover:text-blue-700 dark:hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Login</span>
            </Link>
            <Link href="/" className="inline-flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-blue-600 dark:text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                AnnaPurna
              </span>
            </Link>
            </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-8 px-6 shadow-xl rounded-xl border border-white/20 dark:border-gray-700/50">
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-green-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <ButtonLoading
              type="submit"
              loading={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              Send Reset Email
            </ButtonLoading>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                prefetch={true}
                className="font-medium text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}