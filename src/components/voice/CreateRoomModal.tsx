"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useWallet } from "@/contexts/WalletContext";

interface CreateRoomModalProps {
  onClose: () => void;
  onRoomCreated: () => void;
}

export default function CreateRoomModal({
  onClose,
  onRoomCreated,
}: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [isPublic, setIsPublic] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [speakerMode, setSpeakerMode] = useState<"OPEN" | "NOMINATED">("OPEN");
  const [voiceQuality, setVoiceQuality] = useState<"low" | "medium" | "high">("high");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const { publicKey } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Room name is required");
      return;
    }

    setIsCreating(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (publicKey && !session?.user?.id) {
        headers["X-Wallet-Address"] = publicKey.toBase58();
      }

      const response = await fetch("/api/voice/rooms", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          category: category || null,
          isPublic,
          maxParticipants: parseInt(maxParticipants.toString()) || 50,
          speakerMode,
          voiceQuality,
        }),
      });

      if (response.ok) {
        onRoomCreated();
      } else {
        const data = await response.json();
        console.error("Room creation error:", data);
        setError(data.error || data.details || "Failed to create room. Check server console.");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-white">Create Voice Room</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-100">
              Room Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter room name"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-100">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe your room..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-100">
              Max Participants
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) =>
                setMaxParticipants(parseInt(e.target.value) || 50)
              }
              className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min={2}
              max={100}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-degen-purple focus:ring-degen-purple"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-300">
              Public room (visible to everyone)
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
