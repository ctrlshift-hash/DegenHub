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
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:scale-110 hover:brightness-110 active:scale-95"
            >
              <img
                src="https://static.wixstatic.com/media/e2da02_75efd7a093fd4113a9662b914a541af9~mv2.jpg"
                alt="Twitter"
                className="w-8 h-8 rounded-lg object-contain"
              />
            </a>
            <a
              href="https://pump.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:scale-110 hover:brightness-110 active:scale-95"
            >
              <img
                src="https://static.wixstatic.com/media/e2da02_248e6293fa024f6e9dd4130271bb14c3~mv2.png"
                alt="Pump.fun"
                className="w-8 h-8 rounded-lg object-contain"
              />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all hover:scale-110 hover:brightness-110 active:scale-95"
            >
              <img
                src="https://static.wixstatic.com/media/e2da02_54130f69a18e424cb3f9e81f6d12aaab~mv2.png"
                alt="GitHub"
                className="w-8 h-8 rounded-lg object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

