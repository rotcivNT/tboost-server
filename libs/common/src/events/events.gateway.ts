import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export abstract class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private static channels: Map<string, any> = new Map();
  private static participants: Map<string, string> = new Map(); // sockedId => roomId

  handleDisconnect(socket: Socket) {
    const socketId = socket.id;
    console.log(`Disconnection... socket id:`, socketId);
    const channelId = EventsGateway.participants.get(socketId);
    const channel = EventsGateway.channels.get(channelId);
    if (channel) {
      channel.participants.get(socketId).connected = false;
      this.server.emit(
        `participants/${channelId}`,
        Array.from(channel.participants.values()),
      );
    }
  }

  handleConnection(socket: Socket) {
    const socketId = socket.id;
    console.log(`New connecting... socket id:`, socketId);
    EventsGateway.participants.set(socketId, '');
  }

  @WebSocketServer()
  server: Server;
}
