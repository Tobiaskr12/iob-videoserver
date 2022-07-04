import { Server } from 'socket.io';
import http from 'http';
import Logger from '../Common/Logger.interface';
import { LogLevel } from '../Common/LogLevel.enum';

export class SocketService {
    private io;
    private logger: Logger;

    constructor(server: http.Server, logger: Logger) {
        this.io = new Server(server, {
          cors: {
            origin: "*",
            methods: ["GET", "POST"]
          }
        });
        this.logger = logger;

        this.io.on('connection', (socket) => {
            socket.on('join-room', (roomId) => {
                socket.join(roomId);

                logger.logToBoth(
                  `User ${socket.id} joined room ${roomId}`,
                  LogLevel.INFO
                );
            });

            socket.on('leave-room', (roomId) => {
                socket.leave(roomId);

                logger.logToBoth(
                  `User ${socket.id} left room ${roomId}`,
                  LogLevel.INFO
                );
            });

            socket.on('pwa-location-updated', (data: { location: {lat: number; lng: number}, userId: string  }) => {
              this.io.to('admin').emit('server-location-updated', data);
            });
        });
    }

    public emitToRoom(
        event: string,
        body: Record<string, unknown>,
        roomId: string
    ) {
        this.io.to(roomId).emit(event, body);

        this.logger.logToBoth(
          `Emitted event ${event} to room ${roomId}`,
          LogLevel.INFO
        );
    }

    public emitToUser(
      event: string,
      body: Record<string, unknown>,
      userId: string
    ) {
        this.io.to(userId).emit(event, body);

        this.logger.logToBoth(
          `Emitted a message to user ${userId}`,
          LogLevel.INFO
        );
    }
}