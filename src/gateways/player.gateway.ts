import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Client, Socket } from 'socket.io'
import { Track } from '../track/class/track.class'
import { ParsedTrack } from '../track/class/parsedtrack.class'

@WebSocketGateway()
export class PlayerGateway {

  @WebSocketServer()
  server: Server

  @SubscribeMessage('joinroom')
  handleJoinRoom(socket: Socket, data: any) {
    socket.leaveAll()
    socket.join(data)
  }

  onNewUser(roomCode: string, users: number) {
    this.server.to(roomCode).emit('newuser', users)
  }

  onVoteSkipChange(roomCode: string, votes: number) {
    this.server.to(roomCode).emit('voteskip', votes)
    // this.server.to(roomCode).emit('voteskip', votes)
  }

  onPlaylistChange(roomCode: string, userID: string, playlist: Track[]) {
    const parsedPlaylist = playlist.map(track => {
      return new ParsedTrack(track, userID)
    })
    this.server.to(roomCode).emit('playlistchanged', parsedPlaylist)
  }
}
