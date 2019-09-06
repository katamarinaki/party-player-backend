import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Playlist } from './class/playlist.class'
import { ParsedPlaylist } from './class/parsedplaylist.class'

@WebSocketGateway()
export class TrackGateway {

  @WebSocketServer()
  server: Server

  onPlaylistChange(roomCode: string, playlist: Playlist) {
    const parsedPlaylist = new ParsedPlaylist(playlist)
    this.server.to(roomCode).emit('playlistchanged', parsedPlaylist)
  }
}
