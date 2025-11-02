"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Mic, Users, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWallet } from "@/contexts/WalletContext";
import VoiceChatRoom from "./VoiceChatRoom";
import CreateRoomModal from "./CreateRoomModal";

interface Room {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  maxParticipants: number;
  createdAt: string;
  host: {
    id: string;
    username: string;
    profileImage?: string;
    walletAddress?: string;
    isVerified: boolean;
  };
  participantCount: number;
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<{
    roomUrl: string;
    token: string | null;
    roomName: string;
    roomId?: string;
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();
  const { publicKey } = useWallet();

  useEffect(() => {
    fetchRooms();
    // Refresh rooms every 10 seconds
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/voice/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string, roomName: string) => {
    try {
      // Get user identifier for header
      const headers: Record<string, string> = {};
      if (session?.user?.id) {
        // Email user - handled by session cookie
      } else if (publicKey) {
        headers["X-Wallet-Address"] = publicKey.toBase58();
      }
      // Guest users don't need headers

      const response = await fetch(`/api/voice/rooms/${roomId}/join`, {
        method: "POST",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Join response:", data);
        
        if (!data.room.dailyRoomUrl) {
          alert("Room has no Daily.co URL. The room may not have been created properly. Check your DAILY_API_KEY in the .env file.");
          return;
        }
        
        setSelectedRoom({
          roomUrl: data.room.dailyRoomUrl,
          token: data.token || null,
          roomName: roomName,
          roomId: roomId, // Store room ID for leaving
        });
      } else {
        const error = await response.json();
        console.error("Failed to join room:", error);
        alert(error.error || "Failed to join room. Check console for details.");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room");
    }
  };

  const handleLeaveRoom = async () => {
    if (selectedRoom) {
      // Call leave API to properly remove participant
      try {
        const roomId = selectedRoom.roomId || rooms.find((r) => r.name === selectedRoom.roomName)?.id;
        if (roomId) {
          const headers: Record<string, string> = {};
          if (publicKey) {
            headers["X-Wallet-Address"] = publicKey.toBase58();
          }
          // Properly leave the room (marks participant as left)
          await fetch(`/api/voice/rooms/${roomId}/leave`, {
            method: "POST",
            headers,
          });
        }
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }
    setSelectedRoom(null);
    // Small delay before refreshing to ensure leave is processed
    setTimeout(() => {
      fetchRooms(); // Refresh room list
    }, 500);
  };

  // Get current username for the room
  const getUserName = () => {
    if (session?.user?.username) {
      return session.user.username;
    }
    if (publicKey) {
      return `anon_${publicKey.toBase58().slice(0, 6)}`;
    }
    return "Guest";
  };

  if (selectedRoom) {
    return (
      <VoiceChatRoom
        key={selectedRoom.roomUrl} // Force remount when room changes
        roomUrl={selectedRoom.roomUrl}
        token={selectedRoom.token}
        userName={getUserName()}
        onLeave={handleLeaveRoom}
        roomName={selectedRoom.roomName}
        roomId={selectedRoom.roomId}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Rooms</h1>
          <p className="text-gray-400 mt-1">Join or create a voice chat room</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={() => {
            setShowCreateModal(false);
            fetchRooms();
          }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading rooms...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-gray-700">
          <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No rooms available</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create First Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-card border border-gray-700 rounded-lg p-4 hover:border-degen-purple transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {room.name}
                  </h3>
                  {room.description && (
                    <p className="text-sm text-gray-400 mb-2">
                      {room.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {room.participantCount}/{room.maxParticipants}
                  </span>
                </div>
                <span>Host: @{room.host.username}</span>
              </div>

              <Button
                onClick={() => handleJoinRoom(room.id, room.name)}
                className="w-full"
                disabled={room.participantCount >= room.maxParticipants}
              >
                {room.participantCount >= room.maxParticipants
                  ? "Room Full"
                  : "Join Room"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
