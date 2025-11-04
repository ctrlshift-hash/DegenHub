"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Bell, 
  MessageCircle, 
  User, 
  Settings,
  Hash,
  TrendingUp,
  Wallet,
  TrendingDown,
  Newspaper,
  Skull,
  ThumbsDown,
  Mic,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/channels", icon: Hash, label: "Channels" },
  { href: "/voice-rooms", icon: Mic, label: "Voice Chat" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/top-traders", icon: Wallet, label: "Top Traders" },
  { href: "/jeet-leaderboard", icon: ThumbsDown, label: "Jeet Leaderboard" },
  { href: "/coal-station", icon: Skull, label: "Coal Station" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  // Track visitor on mount
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetch("/api/visitors", { method: "POST" });
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };
    trackVisitor();
  }, []);

  // Fetch live user count and visitor count
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [userResponse, visitorResponse] = await Promise.all([
          fetch("/api/users/count"),
          fetch("/api/visitors"),
        ]);
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserCount(userData.count);
        }
        
        if (visitorResponse.ok) {
          const visitorData = await visitorResponse.json();
          setVisitorCount(visitorData.count);
        }
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
    // Refresh every 10 seconds to keep it live
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText("TBA");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <aside className="hidden md:block w-64 h-screen border-r border-border bg-card">
      <div className="p-6">
        {/* User Count and Visitor Count */}
        <div className="flex items-center justify-end gap-2 mb-6">
          {userCount !== null && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-degen-purple/10 rounded-lg border border-degen-purple/20">
              <Users className="h-3.5 w-3.5 text-degen-purple" />
              <span className="text-xs font-semibold text-degen-purple">
                {userCount.toLocaleString()}
              </span>
            </div>
          )}
          {visitorCount !== null && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-500">
                {visitorCount.toLocaleString()} visitors
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-degen-purple/10 text-degen-purple border border-degen-purple/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* CA */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleCopyCA}
            className="w-full px-4 py-3 bg-degen-purple hover:bg-degen-purple/90 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-degen-purple/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="text-sm">CA: </span>
            <span className="text-sm">
              {copied ? "Copied!" : "TBA"}
            </span>
          </button>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://x.com/DegenHub_io"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-degen-purple hover:bg-degen-purple/90 rounded-lg transition-all hover:scale-110 hover:shadow-lg hover:shadow-degen-purple/30 active:scale-95 flex items-center justify-center"
            >
              <img
                src="https://static.wixstatic.com/media/e2da02_75efd7a093fd4113a9662b914a541af9~mv2.jpg"
                alt="Twitter"
                className="w-6 h-6 object-contain"
              />
            </a>
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-degen-purple hover:bg-degen-purple/90 rounded-lg transition-all hover:scale-110 hover:shadow-lg hover:shadow-degen-purple/30 active:scale-95 flex items-center justify-center"
            >
              <img
                src="https://static.wixstatic.com/media/e2da02_248e6293fa024f6e9dd4130271bb14c3~mv2.png"
                alt="Pump.fun"
                className="w-6 h-6 object-contain"
              />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-degen-purple hover:bg-degen-purple/90 rounded-lg transition-all hover:scale-110 hover:shadow-lg hover:shadow-degen-purple/30 active:scale-95 flex items-center justify-center"
            >
              <img
                src="https://static.wixstatic.com/media/e2da02_54130f69a18e424cb3f9e81f6d12aaab~mv2.png"
                alt="GitHub"
                className="w-6 h-6 object-contain brightness-0 invert"
              />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

