import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CreateRoomDto } from './dto/create-room.dto'
import nanoid from 'nanoid'
import { RoomService } from './room.service'
import { JoinRoomDto } from './dto/join-room.dto'
import { Response } from './classes/response.class'
import { TrackDto } from './dto/track.dto'
import { UserSessionDto } from './dto/user-session.dto';

@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly roomService: RoomService,
  ) { }

  @WebSocketServer()
  server: Server

  handleConnection(socket: Socket) {
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} connected to server.`)
  }

  async handleDisconnect(socket: Socket) {
    const room = await this.roomService.removeUserSession(socket.id)
    if (!room) {
      console.log(`[${(new Date()).toUTCString()}] User #${socket.id} disconnected from server.`)
      return
    }
    this.server.to(room.code).emit('usercount', room.getActiveUsersCount())
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} disconnected from room #${room.code}.`)
  }

  @SubscribeMessage('createroom')
  async createRoom(socket: Socket, createRoomDto: CreateRoomDto) {
    const response = new Response('createroom')
    const userID = nanoid()
    const newRoom = await this.roomService.createRoom(createRoomDto, userID)
    const token = await this.roomService.generateToken(newRoom, userID, true)
    response.setData({
      accessToken: token,
      roomCode: newRoom.code,
    })
    console.log(`[${(new Date()).toUTCString()}] Room #${newRoom.code} created.`)
    return response
  }

  @SubscribeMessage('joinroom')
  async joinRoom(socket: Socket, joinRoomDto: JoinRoomDto) {
    const response = new Response('joinroom')
    const userID = nanoid()
    const room = await this.roomService.joinRoom(joinRoomDto, userID)
    if (!room) {
      response.setErrorMessage('Invalid credentials')
      return response
    }
    const token = await this.roomService.generateToken(room, userID, false)
    response.setData({
      accessToken: token,
    })
    console.log(`[${(new Date()).toUTCString()}] Anonymous user joined room #${room.code}.`)
    return response
  }

  @SubscribeMessage('getroom')
  async getRoom(socket: Socket, token: string) {
    const response = new Response('getroom')
    const decodedToken = this.roomService.decodeToken(token)
    if (!decodedToken) {
      response.setErrorMessage('Invalid Token')
      return response
    }
    const sessionDto = new UserSessionDto(decodedToken, socket.id)
    const room = await this.roomService.addUserSession(sessionDto)
    socket.join(room.code)
    if (!room) {
      response.setErrorMessage('Room or user in room not found')
      return response
    }
    this.server.to(room.code).emit('usercount', room.getActiveUsersCount())
    response.setData({
      room,
    })
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} joined room #${room.code}.`)
    return response
  }

  @SubscribeMessage('addtrack')
  async addTrack(socket: Socket, trackDto: TrackDto) {
    const response = new Response('addtrack')
    const userSession = await this.roomService.verifyUserSession(socket.id)
    if (!userSession) {
      response.setErrorMessage('User session not found')
      return response
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomById(roomID)
    if (!room) {
      response.setErrorMessage('Room not found')
      return response
    }
    const playlist = await this.roomService.addTrackToRoom(room, userID, trackDto)
    if (!playlist) {
      response.setErrorMessage('Error adding a track')
      return response
    }
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} added track to room #${room.code}.`)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('liketrack')
  async likeTrack(socket: Socket, trackUUID: string) {
    const response = new Response('liketrack')
    const userSession = await this.roomService.verifyUserSession(socket.id)
    if (!userSession) {
      response.setErrorMessage('User session not found')
      return response
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomById(roomID)
    if (!room) {
      response.setErrorMessage('Room not found')
      return response
    }
    const playlist = await this.roomService.likeTrackInRoom(room, userID, trackUUID)
    if (!playlist) {
      response.setErrorMessage('Error liking a track')
      return response
    }
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} liked track from room #${room.code}.`)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('disliketrack')
  async dislikeTrack(socket: Socket, trackUUID: string) {
    const response = new Response('disliketrack')
    const userSession = await this.roomService.verifyUserSession(socket.id)
    if (!userSession) {
      response.setErrorMessage('User session not found')
      return response
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomById(roomID)
    if (!room) {
      response.setErrorMessage('Room not found')
      return response
    }
    const playlist = await this.roomService.dislikeTrackInRoom(room, userID, trackUUID)
    if (!playlist) {
      response.setErrorMessage('Error disliking a track')
      return response
    }
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} disliked track from room #${room.code}.`)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('playnexttrack')
  async playNextTrack(socket: Socket) {
    const response = new Response('playnexttrack')
    const userSession = await this.roomService.verifyUserSession(socket.id)
    if (!userSession) {
      response.setErrorMessage('User session not found')
      return response
    }
    const { userID, roomID, isAdmin } = userSession
    if (!isAdmin) {
      response.setErrorMessage('Access denied')
      return response
    }
    const room = await this.roomService.getRoomById(roomID)
    if (!room) {
      response.setErrorMessage('Room not found')
      return response
    }
    const playlist = await this.roomService.playNextTrackInRoom(room, userID)
    if (!playlist) {
      response.setErrorMessage('Error playing next track')
      return response
    }
    console.log(`[${(new Date()).toUTCString()}] Switching current track in room #${room.code}.`)
    this.server.to(room.code).emit('votesforskip', room.votesForSkip.length)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('voteskip')
  async voteforskip(socket: Socket) {
    const response = new Response('voteskip')
    const userSession = await this.roomService.verifyUserSession(socket.id)
    if (!userSession) {
      response.setErrorMessage('User session not found')
      return response
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomById(roomID)
    if (!room) {
      response.setErrorMessage('Room not found')
      return response
    }
    const votescount = await this.roomService.voteForSkipInRoom(room, userID)
    if (!votescount) {
      response.setErrorMessage('Error voting for skip')
      return response
    }
    if (votescount * 2 > room.votesForSkip.length) {
      const playlist = this.roomService.playNextTrackInRoom(room, userID)
      if (!playlist) {
        response.setErrorMessage('Error playing next track')
        return response
      }
      this.server.to(room.code).emit('playlistchanged', playlist)
    }
    console.log(`[${(new Date()).toUTCString()}] User #${socket.id} voted for skip in room #${room.code}.`)
    this.server.to(room.code).emit('votesforskip', votescount)
  }
}
