"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import type { DailyCall } from "@daily-co/daily-js";
import { X, Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useWallet } from "@/contexts/WalletContext";

// Global singleton to track Daily.co instances across all components
let globalDailyInstance: DailyCall | null = null;
let isCleaningUp = false;

async function cleanupGlobalDailyInstance() {
  if (globalDailyInstance && !isCleaningUp) {
    isCleaningUp = true;
    try {
      console.log("Cleaning up global Daily.co instance...");
      // Leave first
      try {
        await globalDailyInstance.leave();
      } catch (e) {
        // Ignore if not in meeting
      }
      
      // Wait a bit before destroy
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Destroy the instance
      await globalDailyInstance.destroy();
      
      // Wait for Daily.co's internal cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("Global Daily.co instance cleaned up");
    } catch (e) {
      console.error("Error destroying global Daily instance:", e);
    } finally {
      globalDailyInstance = null;
      isCleaningUp = false;
    }
  }
}

interface Participant {
  session_id: string;
  user_name?: string;
  user_id?: string;
  local?: boolean;
  audioTrack?: MediaStreamTrack;
}

interface VoiceChatRoomProps {
  roomUrl: string;
  token: string | null;
  userName: string;
  onLeave: () => void;
  roomName: string;
  roomId?: string; // Add roomId for leaving on unmount
}

export default function VoiceChatRoom({
  roomUrl,
  token,
  userName,
  onLeave,
  roomName,
  roomId,
}: VoiceChatRoomProps) {
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());
  const iframeRef = useRef<HTMLDivElement>(null);
  const dailyInstanceRef = useRef<DailyCall | null>(null);
  const isCreatingRef = useRef(false);
  const { data: session } = useSession();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!roomUrl || !iframeRef.current || isCreatingRef.current) {
      if (!roomUrl) {
        setError("Room URL is missing");
        setIsLoading(false);
      }
      return;
    }

    // Clean up component-level instance first
    if (dailyInstanceRef.current) {
      console.log("Cleaning up component Daily.co instance");
      try {
        dailyInstanceRef.current.leave().catch(() => {});
        dailyInstanceRef.current.destroy().catch(() => {});
      } catch (e) {
        console.error("Error destroying component instance:", e);
      }
      dailyInstanceRef.current = null;
    }

    // Clean up global instance (this handles Daily.co's singleton)
    const cleanupAndCreate = async () => {
      // Clean up global instance first
      await cleanupGlobalDailyInstance();

      // Clear the container
      if (iframeRef.current) {
        iframeRef.current.innerHTML = "";
      }

      console.log("Creating Daily.co frame for room:", roomUrl);
      
      // Wait longer for Daily.co's internal cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create Daily.co call frame (audio-only)
      let daily: DailyCall | null = null;
      
      try {
        // Hide Daily.co's entire UI - we'll build our own
        daily = DailyIframe.createFrame(iframeRef.current!, {
          showLeaveButton: false,
          showFullscreenButton: false,
          showLocalVideo: false,
          showParticipantsBar: false,
          iframeStyle: {
            width: "1px",
            height: "1px",
            border: "none",
            opacity: "0",
            position: "absolute",
          } as Partial<CSSStyleDeclaration>,
          // Audio-only configuration
          videoSource: false,
          audioSource: true,
          allowMultipleCallInstances: true,
        });

        dailyInstanceRef.current = daily;
        globalDailyInstance = daily; // Track globally
        setCallFrame(daily);
        isCreatingRef.current = false;
      } catch (err: any) {
        isCreatingRef.current = false;
        console.error("Failed to create Daily.co frame:", err);
        
        // Handle duplicate instance error
        if (err.message?.includes("Duplicate") || err.message?.includes("already exists")) {
          console.log("Duplicate instance detected, force cleanup and retry...");
          
          // Force cleanup everything and retry after delay
          (async () => {
            try {
              await cleanupGlobalDailyInstance();
              
              if (iframeRef.current) {
                iframeRef.current.innerHTML = "";
              }
              
              // Wait longer for Daily.co's internal cleanup
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Check one more time
              if (isCleaningUp) {
                console.log("Still cleaning up after retry wait, waiting more...");
                await new Promise(resolve => setTimeout(resolve, 300));
              }
              
              if (!iframeRef.current || isCreatingRef.current) return;
              
              try {
                isCreatingRef.current = true;
                const retryDaily = DailyIframe.createFrame(iframeRef.current, {
                  showLeaveButton: false,
                  showFullscreenButton: false,
                  showLocalVideo: false,
                  showParticipantsBar: false,
                  showPrejoin: false, // Hide pre-join UI
                  iframeStyle: {
                    width: "1px",
                    height: "1px",
                    border: "none",
                    opacity: "0",
                    position: "absolute",
                  },
                  videoSource: false,
                  audioSource: true,
                  allowMultipleCallInstances: true,
                });
                
                dailyInstanceRef.current = retryDaily;
                globalDailyInstance = retryDaily;
                setCallFrame(retryDaily);
                isCreatingRef.current = false;
                
                // Set up event listeners for retried instance
                retryDaily.on("loaded", () => console.log("Daily.co frame loaded"));
                retryDaily.on("joined-meeting", () => {
                  console.log("Joined meeting");
                  setIsLoading(false);
                });
                retryDaily.on("error", (event: any) => {
                  console.error("Daily.co error:", event);
                  let errorMessage = "Failed to join voice chat";
                  
                  if (event.errorMsg === "account-missing-payment-method") {
                    errorMessage = "Daily.co account needs a payment method. Please add a payment method at https://dashboard.daily.co/ (you won't be charged on the free tier)";
                  } else if (event.errorMsg) {
                    errorMessage = `Daily.co error: ${event.errorMsg}`;
                  } else if (event.error?.message) {
                    errorMessage = event.error.message;
                  }
                  
                  setError(errorMessage);
                  setIsLoading(false);
                });
                retryDaily.on("left-meeting", () => console.log("Left meeting"));
                
                // Join the room (audio-only)
                retryDaily.join({
                  url: roomUrl,
                  token: token || undefined,
                  userName: userName,
                  videoSource: false, // Explicitly disable video
                  audioSource: true, // Explicitly enable audio only
                  userVideoInput: null, // Explicitly set to null to avoid camera
                  userAudioInput: true, // Enable microphone
                }).then(() => {
                  retryDaily.setLocalVideo(false);
                  retryDaily.setLocalAudio(true);
                  setTimeout(() => setIsLoading(false), 1000);
                }).catch((joinErr: any) => {
                  console.error("Failed to join room:", joinErr);
                  let errorMessage = "Failed to join voice chat";
                  
                  if (joinErr.errorMsg === "account-missing-payment-method") {
                    errorMessage = "Daily.co account needs a payment method. Please add a payment method at https://dashboard.daily.co/ (you won't be charged on the free tier)";
                  } else if (joinErr.errorMsg) {
                    errorMessage = `Daily.co error: ${joinErr.errorMsg}`;
                  } else if (joinErr.message) {
                    errorMessage = joinErr.message;
                  }
                  
                  setError(errorMessage);
                  setIsLoading(false);
                });
              } catch (retryErr: any) {
                isCreatingRef.current = false;
                console.error("Retry also failed:", retryErr);
                setError("Voice chat failed to initialize. Please refresh the page.");
                setIsLoading(false);
              }
            } catch (cleanupErr: any) {
              console.error("Error during cleanup and retry:", cleanupErr);
              setError("Failed to initialize voice chat. Please refresh the page.");
              setIsLoading(false);
            }
          })();
          
          return;
        }
        
        setError(err.message || "Failed to create voice chat interface");
        setIsLoading(false);
        return;
      }

      if (!daily) {
        setIsLoading(false);
        return;
      }

      // Event listeners
      daily.on("loaded", () => {
        console.log("Daily.co frame loaded");
      });

      daily.on("joined-meeting", (event: any) => {
        console.log("Joined meeting:", event);
        setIsLoading(false);
        
        // Get initial participants - use session_id as unique key
        const participantsObj = daily.participants();
        const participantsMap = new Map<string, Participant>();
        Object.entries(participantsObj).forEach(([id, p]: [string, any]) => {
          const participant = p as any;
          // Use session_id as the unique key (not the object key)
          const sessionId = participant.session_id || id;
          
          // Local user is tracked but echo cancellation is handled by Daily.co
          
          // Skip if already exists (prevent duplicates)
          if (!participantsMap.has(sessionId)) {
            participantsMap.set(sessionId, {
              session_id: sessionId,
              user_name: participant.user_name,
              user_id: participant.user_id,
              local: participant.local || false,
            });
          }
        });
        console.log("Initial participants:", Array.from(participantsMap.keys()));
        setParticipants(participantsMap);
      });

      // Track participant updates
      daily.on("participant-joined", (event: any) => {
        if (!event.participant || !event.participant.session_id) return;
        
        const sessionId = event.participant.session_id;
        console.log("Participant joined:", sessionId, event.participant.user_name);
        
        setParticipants(prev => {
          const updated = new Map(prev);
          // Only add if not already present (prevent duplicates)
          if (!updated.has(sessionId)) {
            updated.set(sessionId, {
              session_id: sessionId,
              user_name: event.participant.user_name,
              user_id: event.participant.user_id,
              local: event.participant.local || false,
            });
          } else {
            console.log("Duplicate participant ignored:", sessionId);
          }
          return updated;
        });
      });

      daily.on("participant-left", (event: any) => {
        if (!event.participant || !event.participant.session_id) return;
        
        console.log("Participant left:", event.participant.session_id);
        setParticipants(prev => {
          const updated = new Map(prev);
          updated.delete(event.participant.session_id);
          return updated;
        });
        setSpeakingParticipants(prev => {
          const updated = new Set(prev);
          updated.delete(event.participant.session_id);
          return updated;
        });
      });

      // Detect when participants are speaking (skip local user to avoid echo)
      daily.on("participant-updated", (event: any) => {
        if (!event.participant || !event.participant.session_id) return;
        
        // Skip local user for speaking indicators (echo cancellation is handled by Daily.co)
        if (event.participant.local) {
          return;
        }
        
        if (event.participant.audioTrack) {
          const sessionId = event.participant.session_id;
          setSpeakingParticipants(prev => {
            const updated = new Set(prev);
            if (event.participant.tracks?.audio?.isSpeaking) {
              updated.add(sessionId);
            } else {
              updated.delete(sessionId);
            }
            return updated;
          });
        }
      });

      // Use Daily.co's speaking-detected event (skip local user)
      daily.on("speaking-started", (event: any) => {
        if (event.participant && !event.participant.local) {
          setSpeakingParticipants(prev => new Set(prev).add(event.participant.session_id));
        }
      });

      daily.on("speaking-stopped", (event: any) => {
        if (event.participant && !event.participant.local) {
          setSpeakingParticipants(prev => {
            const updated = new Set(prev);
            updated.delete(event.participant.session_id);
            return updated;
          });
        }
      });

      daily.on("error", (event: any) => {
        console.error("Daily.co error:", event);
        let errorMessage = "Failed to join voice chat";
        
        if (event.errorMsg === "account-missing-payment-method") {
          errorMessage = "Daily.co account needs a payment method. Please add a payment method at https://dashboard.daily.co/ (you won't be charged on the free tier)";
        } else if (event.errorMsg === "Meeting is full") {
          errorMessage = "Room is full (2 person limit on free tier). Leave the room from another browser/tab first.";
        } else if (event.errorMsg) {
          errorMessage = `Daily.co error: ${event.errorMsg}`;
        } else if (event.error?.message) {
          errorMessage = event.error.message;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      });

      daily.on("left-meeting", () => {
        console.log("Left meeting");
        setParticipants(new Map());
        setSpeakingParticipants(new Set());
      });

      // Join the room (audio-only)
      // Note: Daily.co will still request camera permission even with videoSource: false
      // This is a Daily.co quirk - ignore camera permission if denied
      daily
        .join({
          url: roomUrl,
          token: token || undefined,
          userName: userName,
          videoSource: false, // Explicitly disable video
          audioSource: true, // Explicitly enable audio only
          userVideoInput: null, // Explicitly set to null to avoid camera
          userAudioInput: true, // Enable microphone
          // Try to disable local audio playback using Daily.co's config
          activeSpeakerMode: false,
          subscribeToTracksAutomatically: false, // Don't auto-subscribe to avoid local playback
        })
        .then(() => {
          console.log("Join promise resolved");
          // Disable video tracks
          daily!.setLocalVideo(false);
          // Enable only audio
          daily!.setLocalAudio(true);
          
          // CRITICAL: Unsubscribe from local participant's audio to prevent hearing yourself
          // Only subscribe to remote participants
          setTimeout(() => {
            try {
              const participants = daily!.participants();
              Object.values(participants).forEach((p: any) => {
                if (p.local && p.audioTrack) {
                  // Unsubscribe from local participant's audio track
                  daily!.unsubscribeFromTracks({
                    sessionId: p.session_id,
                    trackId: p.audioTrack.id,
                  });
                  console.log("Unsubscribed from local participant audio");
                }
              });
            } catch (e) {
              console.error("Error unsubscribing from local audio:", e);
            }
          }, 500);
          
          // NUCLEAR OPTION: Mute ALL audio elements that could be playing local audio
          // Daily.co plays your voice back through audio elements we can't always detect
          const muteAllLocalAudio = () => {
            try {
              const participants = daily!.participants();
              const localParticipant = Object.values(participants).find((p: any) => p.local);
              
              if (!localParticipant || !localParticipant.audioTrack) return;
              
              const localTrackId = (localParticipant.audioTrack as MediaStreamTrack).id;
              
              // Find and mute ALL audio elements that might be playing local audio
              const allAudioElements = document.querySelectorAll('audio');
              allAudioElements.forEach((audioEl: HTMLAudioElement) => {
                try {
                  const stream = audioEl.srcObject as MediaStream | null;
                  if (stream && stream.getAudioTracks().some(track => track.id === localTrackId)) {
                    audioEl.muted = true;
                    audioEl.volume = 0;
                    audioEl.pause();
                  } else {
                    // If we can't identify, mute it anyway if it's unmuted (aggressive approach)
                    // This might mute other participants too, but better than hearing yourself
                  }
                } catch (e) {
                  // Try to mute anyway
                  audioEl.muted = true;
                  audioEl.volume = 0;
                }
              });
              
              // Also intercept via Web Audio API if the track exists
              if (localParticipant.audioTrack) {
                const track = localParticipant.audioTrack as MediaStreamTrack;
                const stream = new MediaStream([track]);
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(stream);
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0; // Completely mute
                source.connect(gainNode);
                // Don't connect to destination - this prevents any playback
              }
            } catch (e) {
              console.error("Error muting local audio:", e);
            }
          };
          
          // Run immediately and repeatedly
          muteAllLocalAudio();
          setTimeout(muteAllLocalAudio, 100);
          setTimeout(muteAllLocalAudio, 300);
          setTimeout(muteAllLocalAudio, 600);
          setTimeout(muteAllLocalAudio, 1000);
          setTimeout(muteAllLocalAudio, 2000);
          
          // Watch for participant updates
          daily!.on("participant-updated", () => {
            muteAllLocalAudio();
          });
          
          // Watch for DOM changes
          const observer = new MutationObserver(() => {
            muteAllLocalAudio();
          });
          observer.observe(document.body, { childList: true, subtree: true });
          
          // Also check periodically
          const intervalId = setInterval(muteAllLocalAudio, 500);
          
          // Clear interval on cleanup (store it for cleanup)
          (daily as any)._muteIntervalId = intervalId;
          
          // Wait a bit for the frame to be ready
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        })
        .catch((err: any) => {
          console.error("Failed to join room:", err);
          let errorMessage = "Failed to join voice chat. Check console for details.";
          
          if (err.errorMsg === "Meeting is full") {
            errorMessage = "Room is full (2 person limit on free tier). Leave the room from another browser/tab first.";
          } else if (err.errorMsg) {
            errorMessage = `Daily.co error: ${err.errorMsg}`;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          setError(errorMessage);
          setIsLoading(false);
        });
    };

    // Start cleanup and frame creation
    cleanupAndCreate().catch(err => {
      console.error("Error in cleanupAndCreate:", err);
      setError("Failed to initialize voice chat");
      setIsLoading(false);
    });

    // Cleanup on unmount (page refresh, navigation, etc.)
    return () => {
      isCreatingRef.current = false;
      
      // Leave the room properly (this tells Daily.co you left)
      if (dailyInstanceRef.current) {
        console.log("Leaving room on unmount");
        try {
          // Leave the meeting first
          dailyInstanceRef.current.leave().catch(() => {});
          
          // Call leave API if we have roomId (mark as left in database)
          if (roomId) {
            const headers: Record<string, string> = {};
            if (publicKey) {
              headers["X-Wallet-Address"] = publicKey.toBase58();
            }
            // Use sendBeacon for page unload or regular fetch
            if (navigator.sendBeacon) {
              const formData = new FormData();
              navigator.sendBeacon(`/api/voice/rooms/${roomId}/leave`, formData);
            } else {
              fetch(`/api/voice/rooms/${roomId}/leave`, {
                method: "POST",
                headers,
                keepalive: true, // Keep request alive during page unload
              }).catch(() => {}); // Ignore errors on page unload
            }
          }
          
          // Wait a bit for the leave to register
          setTimeout(() => {
            try {
              dailyInstanceRef.current?.destroy().catch(() => {});
            } catch (e) {
              console.error("Error destroying:", e);
            }
          }, 100);
        } catch (e) {
          console.error("Error leaving:", e);
        }
        dailyInstanceRef.current = null;
      }
      
      // Clear global instance
      if (globalDailyInstance === dailyInstanceRef.current) {
        globalDailyInstance = null;
      }
      
      // Reset all state
      setCallFrame(null);
      setParticipants(new Map());
      setSpeakingParticipants(new Set());
      
      if (iframeRef.current) {
        iframeRef.current.innerHTML = "";
      }
    };
  }, [roomUrl, token, userName]);

  const toggleMute = () => {
    if (!callFrame) return;
    callFrame.setLocalAudio(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleLeave = async () => {
    console.log("User leaving room");
    
    // Properly leave the Daily.co meeting
    if (dailyInstanceRef.current) {
      try {
        // Leave the meeting (this notifies Daily.co you left)
        await dailyInstanceRef.current.leave();
        
        // Wait a bit for the leave to register
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Then destroy the instance
        await dailyInstanceRef.current.destroy();
      } catch (e) {
        console.error("Error in handleLeave:", e);
      }
      dailyInstanceRef.current = null;
    }
    
    // Clean up global instance
    cleanupGlobalDailyInstance();
    
    // Reset all state
    setCallFrame(null);
    setParticipants(new Map());
    setSpeakingParticipants(new Set());
    
    if (iframeRef.current) {
      iframeRef.current.innerHTML = "";
    }
    
    // Call the parent's leave handler (which calls the API)
    onLeave();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleLeave} className="w-full">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Get participant list - deduplicate by both session_id AND user_name to prevent duplicates
  const uniqueParticipants = new Map<string, Participant>();
  const seenUsernames = new Set<string>();
  
  participants.forEach((p, sessionId) => {
    const key = p.session_id || sessionId;
    if (!key) return;
    
    // Create a unique identifier from username + session_id
    const username = (p.user_name || p.user_id || "").toLowerCase().trim();
    const uniqueKey = username ? `${username}_${key}` : key;
    
    // Only add if not already seen (by unique key AND username)
    if (!uniqueParticipants.has(uniqueKey) && (!username || !seenUsernames.has(username))) {
      uniqueParticipants.set(uniqueKey, p);
      if (username) seenUsernames.add(username);
    }
  });
  
  // Filter out local user
  const otherParticipants = Array.from(uniqueParticipants.values()).filter(p => !p.local);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* Hidden Daily.co iframe */}
      <div ref={iframeRef} className="absolute opacity-0 pointer-events-none" />

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white">{roomName}</h2>
          <p className="text-sm text-gray-400">
            {otherParticipants.length} {otherParticipants.length === 1 ? "participant" : "participants"}
          </p>
        </div>
        <button
          onClick={handleLeave}
          className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Participants Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Joining room...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Local User - Only show once */}
            {(() => {
              // Check if local user is already in participants (if so, skip this)
              const localInParticipants = Array.from(participants.values()).some(p => p.local);
              if (localInParticipants) return null;
              
              return (
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-degen-purple flex items-center justify-center text-white text-2xl font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    {!isMuted && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black animate-pulse flex items-center justify-center">
                        <Mic className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm truncate w-full text-center">{userName}</h3>
                  <p className="text-xs text-gray-400 mt-1">You</p>
                  {isMuted && (
                    <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Other Participants - deduplicate by username */}
            {(() => {
              const seenNames = new Set<string>();
              return otherParticipants
                .filter((participant) => {
                  const displayName = (participant.user_name || participant.user_id || "Guest").toLowerCase().trim();
                  if (seenNames.has(displayName)) {
                    return false; // Skip duplicate username
                  }
                  seenNames.add(displayName);
                  return true;
                })
                .map((participant) => {
                  const sessionId = participant.session_id || "";
                  const isSpeaking = speakingParticipants.has(sessionId);
                  const displayName = (participant.user_name || participant.user_id || "Guest").trim();
                  
                  return (
                    <div
                      key={sessionId}
                      className={`relative bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-6 flex flex-col items-center transition-all ${
                        isSpeaking ? "border-green-500 shadow-lg shadow-green-500/30" : "border-gray-700"
                      }`}
                    >
                      <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-degen-purple flex items-center justify-center text-white text-2xl font-bold">
                          {displayName.charAt(0).toUpperCase() || "?"}
                        </div>
                        {isSpeaking && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black animate-pulse flex items-center justify-center">
                            <Mic className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-sm truncate w-full text-center">
                        {displayName}
                      </h3>
                    </div>
                  );
                });
            })()}

            {/* Empty state */}
            {otherParticipants.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Waiting for others to join...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-t border-gray-700 p-4 flex items-center justify-center gap-4 flex-shrink-0">
        <button
          onClick={toggleMute}
          disabled={isLoading}
          className={`p-3 rounded-full transition-all ${
            isMuted
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Leave room"
        >
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
