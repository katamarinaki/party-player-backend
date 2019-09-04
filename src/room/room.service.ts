import { Injectable, Next, NotFoundException } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { Repository, ObjectID } from 'typeorm'
import { Room } from './room.entity'
import * as bcrypt from 'bcrypt'
import { JoinRoomDto } from './dto/join-room.dto'
import { InjectRepository } from '@nestjs/typeorm'
import * as jwt from 'jsonwebtoken'
import { AccessToken } from './token/token.class'
import { Track } from './track/track.entity'
import { TrackDto } from './track/track.dto'
import { EventsGateway } from './room.gateway'

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly socketGateway: EventsGateway,
  ) { }

  async getById(id: string): Promise<Room> {
    return this.roomRepository.findOne(id)
  }

  async getByCode(code: string): Promise<Room> {
    return this.roomRepository.findOne({ code })
  }

  async addTrack(trackDto: TrackDto, room: Room): Promise<Room> {
    const track = Track.createTrackFromDto(trackDto)
    room.playlist.push(track)
    this.socketGateway.sendNewTrack(room.code, track)
    return await this.roomRepository.save(room)
  }

  async likeTrack(trackID: string, room: Room): Promise<Room> {
    const likedTrack = room.playlist.find((track) => {
      return track.id === trackID
    })
    if (!likedTrack) {
      throw new NotFoundException('Track not found')
    }
    likedTrack.likes++
    this.socketGateway.sendLike(room.code, trackID)
    return await this.roomRepository.save(room)
  }

  async dislikeTrack(trackID: string, room: Room): Promise<Room> {
    const dislikedTrack = room.playlist.find((track) => {
      return track.id === trackID
    })
    dislikedTrack.dislikes++
    if (!dislikedTrack) {
      throw new NotFoundException('Track not found')
    }
    this.socketGateway.sendDislike(room.code, trackID)
    return await this.roomRepository.save(room)
  }

  async addUserAndSave(room: Room, userID: string): Promise<Room> {
    room.users.push(userID)
    return await this.roomRepository.save(room)
  }

  async generateToken(room: Room, userID: string): Promise<AccessToken> {
    const accessToken = jwt.sign({
      roomID: room.id,
      userID,
    }, process.env.TOKEN_SECRET)
    return { accessToken }
  }

  async create(room: CreateRoomDto, userID: string): Promise<Room> {
    const createdRoom = await Room.createRoomFromDto(room)
    return await this.addUserAndSave(createdRoom, userID)
  }

  async join(joinRoomDto: JoinRoomDto, userID: string): Promise<Room> {
    const { code, password } = joinRoomDto
    const room = await this.getByCode(code)
    if (room) {
      const passwordsMatches = await bcrypt.compare(password, room.password)
      if (passwordsMatches) {
        return await this.addUserAndSave(room, userID)
      }
    }
    return null
  }

  // async updateRoom(roomCode, createRoomDto: CreateRoomDto): Promise<Room> {
  //   const updatedRoom = await this.roomModel.findByIdAndUpdate(roomCode, createRoomDto, { new: true });
  //   return updatedRoom;
  // }

  // async deleteRoom(roomCode): Promise<any> {
  //   const deletedRoom = await this.roomModel.findByIdAndRemove(roomCode);
  //   return deletedRoom;
  // }
}
