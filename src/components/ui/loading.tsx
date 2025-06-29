import { Loader2, ChefHat } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({ size = "md", text, className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin text-green-600 ${sizeClasses[size]}`} />
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black z-[9999] backdrop-blur-sm">
      <div className="text-center">
        <div className="relative mb-8">
          <ChefHat className="h-20 w-20 text-green-400 mx-auto animate-bounce" />
          <div className="absolute inset-0 h-20 w-20 mx-auto rounded-full border-2 border-green-400/30 animate-ping"></div>
          <div className="absolute inset-0 h-20 w-20 mx-auto rounded-full border-4 border-green-400/10 animate-pulse"></div>
        </div>
        <div className="relative mb-6">
          <div className="h-3 w-64 bg-gray-800 rounded-full overflow-hidden mx-auto mb-4">
            <div className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="h-1 w-48 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-green-300 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 animate-pulse">
          AnnaPurna
        </h2>
        <p className="text-gray-300 text-lg animate-pulse">Loading your pantry...</p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}

export function FastPageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[9999]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent mx-auto mb-3"></div>
        <p className="text-white text-sm">Loading...</p>
      </div>
    </div>
  );
}

interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function ButtonLoading({ children, loading, ...props }: ButtonLoadingProps) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}