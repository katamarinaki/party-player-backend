import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Track } from '../track/class/track.class'
import { ParsedTrack } from '../track/class/parsedtrack.class'

@WebSocketGateway()
export class PlayerGateway {

  @WebSocketServer()
  server: Server

  onPlaylistChange(roomCode: string, playlist: Track[]) {
    const parsedPlaylist = playlist.map(track => {
      return new ParsedTrack(track)
    })
    this.server.to(roomCode).emit('playlistchanged', parsedPlaylist)
  }
}
