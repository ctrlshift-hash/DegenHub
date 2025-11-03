"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Mic, Users, Plus, Trash2 } from "lucide-react";
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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data: session } = useSession();
  const { publicKey } = useWallet();

  useEffect(() => {
    fetchRooms(0, true); // Initial load
    // Silently update participant counts every 30 seconds (less frequent, no full refresh)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/voice/rooms?limit=100&offset=0`);
        if (response.ok) {
          const data = await response.json();
          const updatedRooms = data.rooms || [];
          // Only update participant counts, don't reset the entire list
          setRooms(prev => prev.map(prevRoom => {
            const updated = updatedRooms.find((r: Room) => r.id === prevRoom.id);
            return updated ? { ...prevRoom, participantCount: updated.participantCount } : prevRoom;
          }));
        }
      } catch (error) {
        // Silent fail - don't disturb the user
        console.error("Background update failed:", error);
      }
    }, 30000); // 30 seconds instead of 10
    return () => clearInterval(interval);
  }, []);
  
  // Auto-join from URL param - check immediately, don't wait for rooms
  useEffect(() => {
    if (selectedRoom) return; // Skip if already in a room
    
    const urlParams = new URLSearchParams(window.location.search);
    const joinRoomId = urlParams.get("join");
    if (joinRoomId) {
      // Join immediately - don't wait for rooms list
      handleJoinRoom(joinRoomId, "").catch(err => {
        console.error("Auto-join failed:", err);
        // Remove the query param on error
        window.history.replaceState({}, "", window.location.pathname);
      });
    }
  }, []); // Run once on mount

  const fetchRooms = async (pageNum: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(pageNum === 0);
        setPage(0);
      } else {
        setIsLoadingMore(true);
      }
      
      const limit = 12; // 12 rooms per page (2 columns x 6 rows = good for most screens)
      const offset = pageNum * limit;
      
      const response = await fetch(`/api/voice/rooms?limit=${limit}&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        const newRooms = data.rooms || [];
        
        if (reset) {
          setRooms(newRooms);
        } else {
          setRooms(prev => [...prev, ...newRooms]);
        }
        
        // Check if there are more rooms
        const currentTotal = reset ? newRooms.length : rooms.length + newRooms.length;
        const totalRooms = data.pagination?.total || 0;
        setHasMore(currentTotal < totalRooms);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  const loadMoreRooms = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRooms(nextPage, false);
    }
  };

  const handleJoinRoom = async (roomId: string, roomName: string) => {
    try {
      // Optimize: Don't wait for room name from rooms list, use API response instead
      // Get user identifier for header
      const headers: Record<string, string> = {};
      if (session?.user?.id) {
        // Email user - handled by session cookie
      } else if (publicKey) {
        headers["X-Wallet-Address"] = publicKey.toBase58();
      }
      // Guest users don't need headers

      // Start joining immediately - don't wait for room name
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
        
        // Set selected room immediately so VoiceChatRoom can start connecting
        setSelectedRoom({
          roomUrl: data.room.dailyRoomUrl,
          token: data.token || null,
          roomName: data.room.name || roomName || "Voice Room",
          roomId: roomId, // Store room ID for leaving
        });
        
        // Remove join query param from URL immediately
        window.history.replaceState({}, "", window.location.pathname);
      } else {
        const error = await response.json();
        console.error("Failed to join room:", error);
        alert(error.error || "Failed to join room. Check console for details.");
        // Remove join query param on error
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room");
      // Remove join query param on error
      window.history.replaceState({}, "", window.location.pathname);
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
    // Silently update participant counts only (no full refresh)
    try {
      const response = await fetch(`/api/voice/rooms?limit=100&offset=0`);
      if (response.ok) {
        const data = await response.json();
        const updatedRooms = data.rooms || [];
        setRooms(prev => prev.map(prevRoom => {
          const updated = updatedRooms.find((r: Room) => r.id === prevRoom.id);
          return updated ? { ...prevRoom, participantCount: updated.participantCount } : prevRoom;
        }));
      }
    } catch (error) {
      // Silent fail
      console.error("Background update failed:", error);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Delete room "${roomName}"? This cannot be undone. The room must be empty.`)) {
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (publicKey) {
        headers["X-Wallet-Address"] = publicKey.toBase58();
      }

      // Optimistic UI update - remove from list immediately
      setRooms(prev => prev.filter(r => r.id !== roomId));
      
      const response = await fetch(`/api/voice/rooms/${roomId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        // Revert optimistic update on error
        const error = await response.json();
        alert(error.error || "Failed to delete room");
        // Re-fetch only if deletion failed
        await fetchRooms(0, true);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room");
    }
  };

  // Check if current user is the host of a room
  const isHost = (room: Room) => {
    if (session?.user?.id) {
      return room.host.id === session.user.id;
    }
    if (publicKey && room.host.walletAddress) {
      return room.host.walletAddress === publicKey.toBase58();
    }
    return false;
  };

  // Get current username for the room
  const getUserName = () => {
    if (session?.user?.username) {
      return session.user.username;
    }
    if (publicKey) {
      // Will use actual username from Daily.co token if available
      return `anon_${publicKey.toBase58().slice(0, 6)}`;
    }
    // For guests, we'll use a generic name - the actual unique username comes from the backend
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Voice Chat</h1>
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
          onRoomCreated={async () => {
            setShowCreateModal(false);
            await fetchRooms(0, true); // Refresh from beginning
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
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {rooms.map((room) => (
              <div
              key={room.id}
              className="bg-card border border-gray-700 rounded-lg p-2 hover:border-degen-purple transition-colors cursor-pointer group"
              onClick={() => !(room.participantCount >= room.maxParticipants) && handleJoinRoom(room.id, room.name)}
            >
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="text-sm font-bold text-white truncate flex-1 min-w-0">
                  {room.name}
                </h3>
                {isHost(room) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id, room.name);
                    }}
                    className="ml-1 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                    title="Delete room (host only)"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-0.5">
                  <Users className="h-3 w-3" />
                  <span>
                    {room.participantCount}/{room.maxParticipants}
                  </span>
                </div>
                <span className="truncate">@{room.host.username}</span>
              </div>

              {room.participantCount >= room.maxParticipants && (
                <div className="mt-1.5 text-xs text-red-400 font-medium">Full</div>
              )}
              </div>
            ))}
          </div>
          
          {/* Load More / Pagination */}
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                onClick={loadMoreRooms}
                disabled={isLoadingMore}
                variant="outline"
                className="min-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Loading...
                  </>
                ) : (
                  "Load More Rooms"
                )}
              </Button>
            </div>
          )}
          
          {!hasMore && rooms.length > 12 && (
            <div className="mt-6 text-center text-gray-400 text-sm">
              No more rooms to load
            </div>
          )}
        </>
      )}
    </div>
  );
}
