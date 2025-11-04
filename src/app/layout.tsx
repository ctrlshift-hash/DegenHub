import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletContextProvider } from "@/contexts/WalletContext";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DegenHub - Crypto Social Media Platform",
  description: "The ultimate social media platform for crypto degens. Connect your wallet, share posts, tip with SOL, and join token-gated communities.",
  icons: {
    icon: [
      {
        url: "https://static.wixstatic.com/media/e2da02_db7d238a37e64190be1d31aecc96f1e5~mv2.png",
        type: "image/png",
        sizes: "any",
      },
    ],
    shortcut: "https://static.wixstatic.com/media/e2da02_db7d238a37e64190be1d31aecc96f1e5~mv2.png",
    apple: "https://static.wixstatic.com/media/e2da02_db7d238a37e64190be1d31aecc96f1e5~mv2.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}