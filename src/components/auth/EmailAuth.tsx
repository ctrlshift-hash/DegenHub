"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Loader2, Mail, User, Lock, CheckCircle2, XCircle } from "lucide-react";

interface EmailAuthProps {
  mode: "login" | "register";
  onSwitchMode: () => void;
  onSubmit: (data: { email: string; username: string; password: string }) => Promise<void>;
}

export default function EmailAuth({ mode, onSwitchMode, onSubmit }: EmailAuthProps) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<"checking" | "available" | "taken" | null>(null);
  const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (mode === "register") {
      if (!formData.username) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = "Username can only contain letters, numbers, and underscores";
      } else if (usernameStatus === "taken") {
        newErrors.username = `The username "${formData.username}" is already taken. Please choose a different username.`;
      } else if (usernameStatus === "checking") {
        newErrors.username = "Please wait while we check username availability";
      } else if (usernameStatus === null && formData.username.length >= 3 && !newErrors.username) {
        // If username is valid length but we haven't checked yet, don't block submission
        // The API will catch it if it's taken
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        
        if (result?.error) {
          console.error("Login failed:", result.error);
        } else {
          // Redirect to home page
          window.location.href = "/";
        }
      } else {
        // Registration
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
          }),
        });

        if (response.ok) {
          // Registration successful, now login
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
          
          if (result?.error) {
            console.error("Auto-login failed:", result.error);
          } else {
            // Redirect to home page
            window.location.href = "/";
          }
        } else {
          const error = await response.json();
          console.error("Registration failed:", error.error);
          // Set specific error for username if that's the issue
          if (error.error?.toLowerCase().includes("username")) {
            setErrors({ username: error.error });
            setUsernameStatus("taken");
          } else if (error.error?.toLowerCase().includes("email")) {
            setErrors({ email: error.error });
          } else {
            setErrors({ general: error.error || "Registration failed" });
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check username availability (debounced)
  useEffect(() => {
    if (mode !== "register" || !formData.username) {
      setUsernameStatus(null);
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Don't check if username is too short
    if (formData.username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    // Set checking status immediately
    setUsernameStatus("checking");

    // Debounce the API call
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(formData.username)}`);
        const data = await response.json();
        
        if (data.available) {
          setUsernameStatus("available");
          // Clear any username error
          setErrors(prev => {
            const updated = { ...prev };
            if (updated.username) {
              delete updated.username;
            }
            return updated;
          });
        } else {
          setUsernameStatus("taken");
          setErrors(prev => ({
            ...prev,
            username: data.reason || `The username "${formData.username}" is already taken. Please choose a different username.`,
          }));
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameStatus(null);
      }
    }, 500); // 500ms debounce

    // Cleanup
    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [formData.username, mode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Reset username status when typing
    if (field === "username") {
      setUsernameStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Mail className="h-12 w-12 mx-auto text-degen-blue mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          {mode === "login" 
            ? "Sign in to your DegenHub account" 
            : "Join the degen community"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="input w-full"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={`input w-full pr-10 ${usernameStatus === "available" ? "border-green-500" : usernameStatus === "taken" ? "border-red-500" : ""}`}
                placeholder="Choose a username"
              />
              {usernameStatus === "checking" && formData.username.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {usernameStatus === "available" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              )}
              {usernameStatus === "taken" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm mt-1 font-medium">{errors.username}</p>
            )}
            {usernameStatus === "taken" && !errors.username && (
              <p className="text-red-500 text-sm mt-1 font-medium">
                This username is already taken. Please choose another.
              </p>
            )}
            {usernameStatus === "available" && (
              <p className="text-green-500 text-sm mt-1 font-medium">✓ This username is available</p>
            )}
            {usernameStatus === "checking" && formData.username.length >= 3 && (
              <p className="text-gray-400 text-sm mt-1">Checking availability...</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="input w-full"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={onSwitchMode}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Sign in"
          }
        </button>
      </div>
    </div>
  );
}

