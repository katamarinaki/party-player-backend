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

  onPlaylistChanges(roomCode: string, playlist: Playlist) {
    this.server.to(roomCode).emit('playlistchanged', playlist)
  }
}
