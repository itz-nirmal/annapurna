"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChefHat, Send, X, RotateCcw } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expirationDate: string;
}

interface User {
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface RecipeChatbotProps {
  inventory?: InventoryItem[];
  user?: User | null;
}

export default function RecipeChatbot({
  inventory = [],
  user,
}: RecipeChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    if (user) {
      const userKey = user.email || 'default-user';
      const savedMessages = localStorage.getItem(`chatbot-messages-${userKey}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error loading saved messages:', error);
        }
      }
    }
  }, [user]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      const userKey = user.email || 'default-user';
      localStorage.setItem(`chatbot-messages-${userKey}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      // Show personalized welcome message when first opened
      const userName =
        user.user_metadata?.full_name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "there";
      const welcomeMessage: Message = {
        id: "welcome",
        type: "bot",
        content: `Hii ${userName}, I am a recipe generator bot. How can I help you?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, user]);

  const callDeepSeekAPI = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    try {
      // Build conversation context from message history
      const conversationMessages = conversationHistory.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
      conversationMessages.push({
        role: 'user',
        content: userMessage
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages,
          inventory: inventory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Chat API Error:', response.status, errorData);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "Sorry, I couldn't generate a response right now. Please try again.";
    } catch (error) {
      console.error("Chat API Error:", error);
      return "Sorry, I'm having trouble connecting to my recipe database. Please try again in a moment.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: Date.now(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const botResponse = await callDeepSeekAPI(userMessage.content, messages);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    if (user) {
      const userKey = user.email || 'default-user';
      localStorage.removeItem(`chatbot-messages-${userKey}`);
    }
    setMessages([]);
    if (user) {
      const userName =
        user.user_metadata?.full_name?.split(" ")[0] ||
        user.email?.split("@")[0] ||
        "there";
      const welcomeMessage: Message = {
        id: "welcome-new",
        type: "bot",
        content: `Hii ${userName}, I am a recipe generator bot. How can I help you?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  // Show welcome popup after login and on page refresh
  useEffect(() => {
    if (user && !isOpen) {
      const userKey = user.email || 'default';
      const hasShownWelcome = sessionStorage.getItem(`chatbot-welcome-shown-${userKey}`);
      
      if (!hasShownWelcome) {
        const timer = setTimeout(() => {
          setShowWelcome(true);
          sessionStorage.setItem(`chatbot-welcome-shown-${userKey}`, 'true');
          // Auto-hide welcome after 8 seconds
          setTimeout(() => setShowWelcome(false), 8000);
        }, 1500); // Show 1.5 seconds after login

        return () => clearTimeout(timer);
      }
    }
  }, [user, isOpen]);

  // Hide welcome popup when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowWelcome(false);
    }
  }, [isOpen]);

  if (!user) return null;

  return (
    <>
      {/* Welcome Popup - Enhanced with animations and better visibility */}
      {showWelcome && (
        <div className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white p-5 rounded-xl shadow-2xl z-50 max-w-sm border-2 border-white/20 animate-bounce">
          <div className="relative">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <ChefHat className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">
                  👋 Hey{" "}
                  {user.user_metadata?.full_name?.split(" ")[0] ||
                    user.email?.split("@")[0] ||
                    "there"}!
                </div>
                <p className="text-sm leading-relaxed">
                  I&apos;m your AI Recipe Generator! 🍳✨
                  <br />
                  <span className="font-medium">Click me to get personalized recipes using your pantry items!</span>
                </p>
                <button
                  onClick={() => {
                    setShowWelcome(false);
                    setIsOpen(true);
                  }}
                  className="mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  Let&apos;s Cook! 🚀
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute -top-1 -right-1 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-colors"
              aria-label="Close Welcome"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 animate-pulse hover:animate-none"
        aria-label="Open Recipe Chatbot"
      >
        <ChefHat className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5" />
              <h3 className="font-semibold">AI Recipe Generator</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={startNewChat}
                className="text-white hover:text-gray-200 transition-colors"
                title="Start New Chat"
                aria-label="Start New Chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Start New Chat Button after each bot response */}
            {messages.length > 1 &&
              messages[messages.length - 1].type === "bot" &&
              !isLoading && (
                <div className="flex justify-center">
                  <button
                    onClick={startNewChat}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-sm rounded-full transition-all duration-200 flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Start New Chat</span>
                  </button>
                </div>
              )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me for any recipe..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-2 rounded-lg transition-all duration-200"
                aria-label="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
