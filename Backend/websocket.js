import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  const groupClients = new Map(); // Map to store group connections

  wss.on('connection', (ws) => {
    let userId = null;
    let groupId = null;

    ws.on('message', async (message) => {
      console.log("Received message:", message); // Debugging: Log received message
      const data = JSON.parse(message);

      switch (data.type) {
        case "join":
          userId = data.userId;
          groupId = data.groupId;

          if (!groupClients.has(groupId)) {
            groupClients.set(groupId, new Set());
          }
          groupClients.get(groupId).add(ws);

          // Load previous messages
          const messages = await prisma.groupMessage.findMany({
            where: { groupId: groupId },
            include: { user: true },
            orderBy: { createdAt: "asc" },
            take: 50,
          });

          ws.send(
            JSON.stringify({
              type: "history",
              messages: messages,
            })
          );
          break;

        case "message":
          if (groupId && userId) {
            const message = await prisma.groupMessage.create({
              data: {
                content: data.content,
                userId: userId,
                groupId: groupId,
              },
              include: { user: true },
            });
            console.log("Broadcasting message:", message); // Debugging: Log message being broadcasted

            // Broadcast to all clients in the group
            const clients = groupClients.get(groupId) || new Set();
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "message",
                    message,
                  })
                );
              }
            });
          }
          break;
      }
    });

    ws.on('close', () => {
      if (groupId && groupClients.has(groupId)) {
        groupClients.get(groupId).delete(ws);
      }
    });
  });
}
