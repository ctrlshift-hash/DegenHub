"use client";

import RoomList from "@/components/voice/RoomList";
import Layout from "@/components/layout/Layout";
import { useSession } from "next-auth/react";

export default function VoiceRoomsPage() {
  const { data: session } = useSession();
  
  return (
    <Layout user={session?.user ? {
      id: session.user.id,
      username: session.user.username || "",
      walletAddress: undefined,
      isVerified: session.user.isVerified || false,
      profileImage: undefined,
    } : null}>
      <RoomList />
    </Layout>
  );
}
