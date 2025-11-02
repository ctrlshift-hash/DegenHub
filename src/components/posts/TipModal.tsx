"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black z-[9999] overflow-y-auto p-4">
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col my-auto">
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Tip @{recipientUsername}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 overflow-y-auto flex-1" style={{ minHeight: 0 }}>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 pb-2">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-100">
                Amount (SOL)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.01"
                max="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.1"
                disabled={isSending}
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum: 0.01 SOL | Maximum: 10 SOL
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Recipient:</span>
              <span className="font-mono text-xs text-white">{recipientAddress.slice(0, 8)}...{recipientAddress.slice(-8)}</span>
            </div>

            {!publicKey && (
              <div className="text-xs text-gray-400 text-center space-y-2">
                <p>Connect your wallet to send a tip</p>
                <p className="text-degen-purple">💡 Make sure your wallet extension is installed and connected</p>
              </div>
            )}
            
            {publicKey && !sendTransaction && (
              <p className="text-xs text-yellow-500 text-center">
                Wallet connected but transaction function unavailable. Try reconnecting.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 flex gap-2 flex-shrink-0 border-t border-gray-700">
          <Button
            onClick={handleTip}
            disabled={isSending || !publicKey}
            className="flex-1"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Tip
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

