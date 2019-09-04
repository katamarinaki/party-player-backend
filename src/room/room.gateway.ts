import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Client, Server } from 'socket.io'
import { Track } from './track/track.entity'
import { RoomService } from './room.service'
// 3001, {
//   transports: ['websocket'],
// }
@WebSocketGateway()
export class EventsGateway {

  @WebSocketServer()
  server: Server

  sendNewTrack(roomCode: string, track: Track) {
    this.server.to(roomCode).emit('newtrack', track)
  }

  sendLike(roomCode: string, trackID: string) {
    this.server.to(roomCode).emit('like', trackID)
  }

  sendDislike(roomCode: string, trackID: string) {
    this.server.to(roomCode).emit('dislike', trackID)
  }
}
