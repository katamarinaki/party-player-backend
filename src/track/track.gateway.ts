import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Track } from './class/track.class'
import { ParsedTrack } from './class/parsedtrack.class'

@WebSocketGateway()
export class TrackGateway {

  @WebSocketServer()
  server: Server

  onPlaylistChange(roomCode: string, playlist: Track[]) {
    const parsedPlaylist = playlist.map(track => {
      return new ParsedTrack(track)
    })
    this.server.to(roomCode).emit('playlistchanged', parsedPlaylist)
  }
}
