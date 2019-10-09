import { Injectable } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { Repository } from 'typeorm'
import { Room } from './entities/room.entity'
import * as bcrypt from 'bcrypt'
import { JoinRoomDto } from './dto/join-room.dto'
import { InjectRepository } from '@nestjs/typeorm'
import * as jwt from 'jsonwebtoken'
import ParsedRoom from './classes/parsedroom.class'
import { UserSession } from './entities/user-session.entity'
import { ITokenPayload } from './interfaces/tokenpayload.interface'
import { TrackDto } from './dto/track.dto'
import { ParsedTrack } from './classes/parsedtrack.class'
import { Track } from './classes/track.class'
import { UserSessionDto } from './dto/user-session.dto'
@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) { }

  async getRoomById(roomID: string): Promise<Room> {
    return await this.roomRepository.findOne(roomID)
  }

  parseRoom(room: Room, userID: string): ParsedRoom {
    return new ParsedRoom(room, userID)
  }

  async addUserAndSave(room: Room, userID: string): Promise<Room> {
    room.users.push({
      userID,
      connected: false,
    })
    return await this.roomRepository.save(room)
  }

  async generateToken(room: Room, userID: string, isAdmin: boolean): Promise<string> {
    const accessToken = jwt.sign({
      roomID: room.id,
      isAdmin,
      userID,
    }, process.env.TOKEN_SECRET)
    return accessToken
  }

  async createRoom(room: CreateRoomDto, userID: string): Promise<Room> {
    const createdRoom = await Room.createFromDto(room)
    return await this.addUserAndSave(createdRoom, userID)
  }

  async joinRoom(joinRoomDto: JoinRoomDto, userID: string): Promise<Room> {
    const { code, password } = joinRoomDto
    const joinedRoom = await this.roomRepository.findOne({ code })
    if (joinedRoom) {
      const passwordsMatches = await bcrypt.compare(!password ? '' : password, joinedRoom.password)
      if (passwordsMatches) {
        return await this.addUserAndSave(joinedRoom, userID)
      }
    }
    return null
  }

  decodeToken(token: string): ITokenPayload {
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET) as ITokenPayload
      return decodedToken
    } catch (error) {
      return null
    }
  }

  async addUserSession(userSessionDto: UserSessionDto): Promise<Room> {
    console.log('add user session')
    const userSession = UserSession.createFromDto(userSessionDto)
    console.log(userSession)
    const savedSession = await this.sessionRepository.save(userSession)
    console.log(savedSession)
    console.log('session saved')
    const room = await this.roomRepository.findOne(savedSession.roomID)
    if (!room) {
      return null
    }
    const userRecord = room.users.find((record) => {
      return record.userID === savedSession.userID
    })
    userRecord.connected = true
    const savedRoom = await this.roomRepository.save(room)
    return savedRoom
  }

  async removeUserSession(socketID: string): Promise<Room> {
    const userSession = await this.sessionRepository.findOne({ socketID })
    if (!userSession) {
      return null
    }
    const room = await this.roomRepository.findOne(userSession.roomID)
    if (!room) {
      return null
    }
    const userRecord = room.users.find((record) => {
      return record.userID === userSession.userID
    })
    userRecord.connected = false
    await this.sessionRepository.delete({ socketID })
    return room
  }

  async verifyUserSession(socketID: string): Promise<ITokenPayload> {
    const userSession = await this.sessionRepository.findOne({ socketID })
    if (!userSession) {
      return null
    }
    return userSession
  }

  sortRoomPlaylist(playlist: Track[]) {
    const firstTrack = playlist.shift()
    playlist.sort((trackA, trackB) => {
      if ((trackA.likes.length - trackA.dislikes.length) > (trackB.likes.length - trackB.dislikes.length)) {
        return -1
      } else if (trackA.likes.length > trackB.likes.length) {
        return -1
      } else if (trackA.dislikes.length < trackB.dislikes.length) {
        return -1
      }
      return 1
    })
    playlist.unshift(firstTrack)
  }

  async addTrackToRoom(room: Room, userID: string, trackDto: TrackDto): Promise<ParsedTrack[]> {
    const track = new Track(trackDto)
    room.playlist.push(track)
    const savedRoom = await this.roomRepository.save(room)
    const parsedRoom = new ParsedRoom(savedRoom, userID)
    return parsedRoom.playlist
  }

  async likeTrackInRoom(room: Room, userID: string, trackUUID: string): Promise<ParsedTrack[]> {
    const track = room.playlist.find((trackObject) => {
      return trackObject.uuid === trackUUID
    })
    if (!track) {
      return null
    }
    const isLiked = track.likes.includes(userID)
    if (!isLiked) {
      track.likes.push(userID)
      const dislikeIndex = track.dislikes.indexOf(userID)
      if (dislikeIndex >= 0) {
        track.dislikes.splice(dislikeIndex, 1)
      }
      this.sortRoomPlaylist(room.playlist)
      const savedRoom = await this.roomRepository.save(room)
      const parsedRoom = new ParsedRoom(savedRoom, userID)
      return parsedRoom.playlist
    } else {
      const parsedRoom = new ParsedRoom(room, userID)
      return parsedRoom.playlist
    }
  }

  async dislikeTrackInRoom(room: Room, userID: string, trackUUID: string): Promise<ParsedTrack[]> {
    const track = room.playlist.find((trackObject) => {
      return trackObject.uuid === trackUUID
    })
    if (!track) {
      return null
    }
    const isDisliked = track.dislikes.includes(userID)
    if (!isDisliked) {
      track.dislikes.push(userID)
      const likeIndex = track.likes.indexOf(userID)
      if (likeIndex >= 0) {
        track.likes.splice(likeIndex, 1)
      }
      this.sortRoomPlaylist(room.playlist)
      const savedRoom = await this.roomRepository.save(room)
      const parsedRoom = new ParsedRoom(savedRoom, userID)
      return parsedRoom.playlist
    } else {
      const parsedRoom = new ParsedRoom(room, userID)
      return parsedRoom.playlist
    }
  }

  async playNextTrackInRoom(room: Room, userID: string): Promise<ParsedTrack[]> {
    room.playlist.shift()
    room.votesForSkip = []
    const savedRoom = await this.roomRepository.save(room)
    if (!savedRoom) {
      return null
    }
    const parsedRoom = new ParsedRoom(room, userID)
    return parsedRoom.playlist
  }

  async voteForSkipInRoom(room: Room, userID: string): Promise<number> {
    const isVoted = room.votesForSkip.includes(userID)
    if (!isVoted) {
      room.votesForSkip.push(userID)
    } else {
      room.votesForSkip.splice(room.votesForSkip.indexOf(userID), 1)
    }
    await this.roomRepository.save(room)
    return room.votesForSkip.length
  }
}
