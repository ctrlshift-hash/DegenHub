"use client";

import { useState } from "react";
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
  ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/channels", icon: Hash, label: "Channels" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/top-traders", icon: Wallet, label: "Top Traders" },
  { href: "/jeet-leaderboard", icon: ThumbsDown, label: "Jeet Leaderboard" },
  { href: "/coal-station", icon: Skull, label: "Coal Station" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

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
    <aside className="hidden lg:block w-64 h-screen border-r border-border bg-card">
      <div className="p-6">
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
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <button
            onClick={handleCopyCA}
            className="w-full text-left cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium text-muted-foreground">CA: </span>
            <span className="text-sm font-medium text-foreground">
              {copied ? "Copied!" : "TBA"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

