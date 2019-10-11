import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import CreateRoomDto from './dto/create-room.dto'
import nanoid from 'nanoid'
import RoomService from './services/room.service'
import JoinRoomDto from './dto/join-room.dto'
import Response from './classes/response.class'
import TrackDto from './dto/track.dto'
import UserSessionDto from './dto/user-session.dto'
import SessionService from './services/session.service'
import PlaylistService from './services/playlist.service'
import Logger from './classes/logger.class'

@WebSocketGateway()
export default class PlayerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly roomService: RoomService,
    private readonly sessionService: SessionService,
    private readonly playlistService: PlaylistService,
  ) { }

  @WebSocketServer()
  server: Server

  handleConnection(socket: Socket) {
    Logger.log(`User #${socket.id} connected to server.`)
  }

  async handleDisconnect(socket: Socket) {
    const room = await this.sessionService.deleteSession(socket.id)
    if (!room) {
      Logger.log(`User #${socket.id} disconnected from server.`)
      return
    }
    this.server.to(room.code).emit('userscount', room.getActiveUsersCount())
    Logger.log(`User #${socket.id} disconnected from room #${room.code}.`)
  }

  @SubscribeMessage('createroom')
  async createRoom(socket: Socket, createRoomDto: CreateRoomDto) {
    const response = new Response('createroom')
    const userID = nanoid()
    const newRoom = await this.roomService.createRoom(createRoomDto, userID)
    const accessToken = newRoom.generateTokenForUser(userID, true)
    Logger.log(`Room #${newRoom.code} created.`)
    return response.sendData({
      accessToken,
      roomCode: newRoom.code,
    })
  }

  @SubscribeMessage('joinroom')
  async joinRoom(socket: Socket, joinRoomDto: JoinRoomDto) {
    const response = new Response('joinroom')
    const userID = nanoid()
    const room = await this.roomService.joinRoom(joinRoomDto, userID)
    if (!room) {
      return response.throwError('Invalid credentials')
    }
    const accessToken = room.generateTokenForUser(userID, true)
    Logger.log(`Anonymous user joined room #${room.code}.`)
    return response.sendData({
      accessToken,
    })
  }

  @SubscribeMessage('getroom')
  async getRoom(socket: Socket, token: string) {
    const response = new Response('getroom')
    const decodedToken = this.sessionService.decodeToken(token)
    if (!decodedToken) {
      return response.throwError('Invalid Token')
    }
    const sessionDto = new UserSessionDto(decodedToken, socket.id)
    const room = await this.sessionService.createSession(sessionDto)
    socket.join(room.code)
    if (!room) {
      return response.throwError('Room or user in room not found')
    }
    this.server.to(room.code).emit('userscount', room.getActiveUsersCount())
    const parsedRoom = room.getParsedRoom(decodedToken.userID)
    Logger.log(`User #${socket.id} joined room #${room.code}.`)
    return response.sendData({
      parsedRoom,
    })
  }

  @SubscribeMessage('addtrack')
  async addTrack(socket: Socket, trackDto: TrackDto) {
    const response = new Response('addtrack')
    const userSession = await this.sessionService.verifySession(socket.id)
    if (!userSession) {
      return response.throwError('User session not found')
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomByID(roomID)
    if (!room) {
      return response.throwError('Room not found')
    }
    const playlist = await this.playlistService.addTrack(room, userID, trackDto)
    if (!playlist) {
      return response.throwError('Error adding a track')
    }
    Logger.log(`User #${socket.id} added track to room #${room.code}.`)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('liketrack')
  async likeTrack(socket: Socket, trackUUID: string) {
    const response = new Response('liketrack')
    const userSession = await this.sessionService.verifySession(socket.id)
    if (!userSession) {
      return response.throwError('User session not found')
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomByID(roomID)
    if (!room) {
      return response.throwError('Room not found')
    }
    const playlist = await this.playlistService.likeTrack(room, userID, trackUUID)
    if (!playlist) {
      return response.throwError('Error liking a track')
    }
    Logger.log(`User #${socket.id} liked track from room #${room.code}.`)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('disliketrack')
  async dislikeTrack(socket: Socket, trackUUID: string) {
    const response = new Response('disliketrack')
    const userSession = await this.sessionService.verifySession(socket.id)
    if (!userSession) {
      return response.throwError('User session not found')
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomByID(roomID)
    if (!room) {
      return response.throwError('Room not found')
    }
    const playlist = await this.playlistService.dislikeTrack(room, userID, trackUUID)
    if (!playlist) {
      return response.throwError('Error disliking a track')
    }
    Logger.log(`User #${socket.id} disliked track from room #${room.code}.`)
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('playnexttrack')
  async playNextTrack(socket: Socket) {
    const response = new Response('playnexttrack')
    const userSession = await this.sessionService.verifySession(socket.id)
    if (!userSession) {
      return response.throwError('User session not found')
    }
    const { userID, roomID, isAdmin } = userSession
    if (!isAdmin) {
      return response.throwError('Access denied')
    }
    const room = await this.roomService.getRoomByID(roomID)
    if (!room) {
      return response.throwError('Room not found')
    }
    const playlist = await this.playlistService.playNextTrack(room, userID)
    if (!playlist) {
      return response.throwError('Error playing next track')
    }
    Logger.log(`Switching current track in room #${room.code}.`)
    this.server.to(room.code).emit('votesforskip', room.getVotesForSkip())
    this.server.to(room.code).emit('playlistchanged', playlist)
  }

  @SubscribeMessage('voteskip')
  async voteforskip(socket: Socket) {
    const response = new Response('voteskip')
    const userSession = await this.sessionService.verifySession(socket.id)
    if (!userSession) {
      return response.throwError('User session not found')
    }
    const { userID, roomID } = userSession
    const room = await this.roomService.getRoomByID(roomID)
    if (!room) {
      return response.throwError('Room not found')
    }
    const votescount = await this.roomService.voteForSkipInRoom(room, userID)
    if (!votescount) {
      return response.throwError('Error voting for skip')
    }
    if (votescount * 2 > room.getVotesForSkip()) {
      const playlist = this.playlistService.playNextTrack(room, userID)
      if (!playlist) {
        return response.throwError('Error playing next track')
      }
      this.server.to(room.code).emit('playlistchanged', playlist)
    }
    Logger.log(`User #${socket.id} voted for skip in room #${room.code}.`)
    this.server.to(room.code).emit('votesforskip', votescount)
  }
}
