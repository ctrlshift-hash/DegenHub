"use client";

import { useState } from "react";
import { useWallet as useAdapterWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/Button";
import { X, Send, Loader2 } from "lucide-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  recipientAddress: string;
  recipientUsername: string;
  onSuccess?: () => void;
}

export default function TipModal({
  isOpen,
  onClose,
  postId,
  recipientAddress,
  recipientUsername,
  onSuccess,
}: TipModalProps) {
  const { publicKey, sendTransaction } = useAdapterWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState("0.1");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTip = async () => {
    if (!publicKey) {
      setError("Please connect your wallet to send a tip");
      return;
    }
    
    if (!sendTransaction) {
      setError("Wallet connection error. Please reconnect your wallet.");
      return;
    }
    
    if (!connection) {
      setError("Connection error. Please refresh the page.");
      return;
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (tipAmount > 10) {
      setError("Maximum tip amount is 10 SOL");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Convert SOL to lamports
      const lamports = tipAmount * LAMPORTS_PER_SOL;
      
      // Create recipient public key
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch (e) {
        setError("Invalid recipient address");
        setIsSending(false);
        return;
      }

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(lamports),
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // Send tip record to backend
      const headers: Record<string, string> = {};
      if (publicKey) {
        headers["X-Wallet-Address"] = publicKey.toBase58();
      }

      const response = await fetch(`/api/posts/${postId}/tip`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: tipAmount,
          transactionSignature: signature,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record tip");
      }

      onSuccess?.();
      onClose();
      setAmount("0.1");
    } catch (err: any) {
      console.error("Tip error:", err);
      setError(err.message || "Failed to send tip. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-degen-purple/20 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-degen-purple/20 mt-auto mb-auto">
        {/* Header with gradient accent */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-degen-purple/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-degen-purple to-degen-pink flex items-center justify-center">
              <img src="https://static.wixstatic.com/media/e2da02_a2f337f44f9b4fea9f3284c060b7d197~mv2.png" alt="" className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-degen-purple to-degen-pink bg-clip-text text-transparent">
              Tip @{recipientUsername}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-300">
              Amount (SOL)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.01"
                max="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl focus:outline-none focus:border-degen-purple transition-colors text-white placeholder-gray-500"
                placeholder="0.1"
                disabled={isSending}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-degen-purple font-semibold">
                SOL
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Minimum: 0.01 SOL | Maximum: 10 SOL
            </p>
          </div>

          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 font-medium">Recipient:</span>
              <span className="font-mono text-sm text-degen-purple font-semibold">{recipientAddress.slice(0, 8)}...{recipientAddress.slice(-8)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleTip}
              disabled={isSending || !publicKey}
              variant="glow"
              className="flex-1 h-12 text-base font-semibold"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Tip
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSending}
              className="flex-1 h-12 text-base font-semibold border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>

          {!publicKey && (
            <div className="bg-degen-purple/10 border border-degen-purple/30 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-300 mb-2">Connect your wallet to send a tip</p>
              <p className="text-xs text-degen-purple font-medium">💡 Make sure your wallet extension is installed and connected</p>
            </div>
          )}
          
          {publicKey && !sendTransaction && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-xs text-yellow-400 text-center">
                Wallet connected but transaction function unavailable. Try reconnecting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

