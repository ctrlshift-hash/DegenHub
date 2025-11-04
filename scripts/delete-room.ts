import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Delete room by name or ID
const roomName = 'random'; // Change this to the room name or use room ID

async function deleteRoom() {
  try {
    // First, find the room by name
    const room = await prisma.voiceRoom.findFirst({
      where: {
        name: roomName,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!room) {
      console.error('❌ Room not found:', roomName);
      process.exit(1);
    }

    console.log(`Found room: ${room.name} (ID: ${room.id})`);

    // Mark all participants as left first
    await prisma.roomParticipant.updateMany({
      where: {
        roomId: room.id,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });
    console.log('✅ Marked all participants as left');

    // Delete the room using raw SQL to avoid isClosed column issues
    try {
      await prisma.$executeRaw`DELETE FROM voice_rooms WHERE id = ${room.id}`;
      console.log('✅ Room deleted successfully!');
    } catch (rawError: any) {
      // If raw SQL fails, try Prisma delete as fallback
      console.warn('Raw SQL delete failed, trying Prisma delete:', rawError);
      await prisma.voiceRoom.delete({
        where: { id: room.id },
      });
      console.log('✅ Room deleted successfully via Prisma!');
    }
  } catch (error: any) {
    console.error('❌ Error deleting room:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteRoom();

