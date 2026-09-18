import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer, clientUrls: string[]): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: clientUrls,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for user specific notifications
    socket.on('join_user_room', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] User ${userId} joined their personal room`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('[Socket.IO] Socket.io has not been initialized yet.');
  }
  return io;
};
