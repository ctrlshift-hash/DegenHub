import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roomId = 'd27a1bad-f395-45e9-95bd-18e779057655';

async function closeRoom() {
  try {
    // Try to update isClosed field using raw SQL (in case column exists)
    try {
      await prisma.$executeRaw`UPDATE voice_rooms SET is_closed = true WHERE id = ${roomId}`;
      console.log('✅ Room closed successfully via isClosed field');
    } catch (error: any) {
      // If raw SQL fails, mark all participants as left to effectively close the room
      console.log('⚠️ isClosed update failed, marking participants as left...');
      await prisma.roomParticipant.updateMany({
        where: {
          roomId: roomId,
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      });
      console.log('✅ Room participants marked as left (room effectively closed)');
    }
    
    // Log to history
    const room = await prisma.voiceRoom.findUnique({
      where: { id: roomId },
      select: { hostId: true },
    });
    
    if (room) {
      await prisma.roomHistory.create({
        data: {
          roomId: roomId,
          userId: room.hostId,
          action: 'room_closed',
        },
      }).catch(() => {}); // Ignore if fails
    }
    
    console.log('✅ Room closed successfully!');
  } catch (error: any) {
    console.error('❌ Error closing room:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

closeRoom();

