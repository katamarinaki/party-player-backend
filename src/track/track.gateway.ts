import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Playlist } from './class/playlist.class'

@WebSocketGateway()
export class TrackGateway {

  @WebSocketServer()
  server: Server

  // TO DO - превратить все три метода в один метод playlistChanges
  sendNewTrack(roomCode: string, playlist: Playlist) {
    this.server.to(roomCode).emit('newtrack', playlist)
  }

  sendLike(roomCode: string, playlist: Playlist) {
    this.server.to(roomCode).emit('like', playlist)
  }

  sendDislike(roomCode: string, playlist: Playlist) {
    this.server.to(roomCode).emit('dislike', playlist)
  }
}
