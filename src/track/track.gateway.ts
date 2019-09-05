import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Track } from './class/track.class'

@WebSocketGateway()
export class TrackGateway {

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
