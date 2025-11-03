import RoomList from "@/components/voice/RoomList";
import Layout from "@/components/layout/Layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VoiceRoomsPage() {
  const session = await getServerSession(authOptions);
  
  // Get user data for Layout
  let user = null;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        walletAddress: true,
        isVerified: true,
        profileImage: true,
      },
    });
    if (dbUser) {
      user = {
        id: dbUser.id,
        username: dbUser.username || session.user.username || "user",
        walletAddress: dbUser.walletAddress ?? undefined,
        isVerified: dbUser.isVerified || false,
        profileImage: dbUser.profileImage ?? undefined,
      };
    }
  }
  
  return (
    <Layout user={user}>
      <RoomList />
    </Layout>
  );
}
