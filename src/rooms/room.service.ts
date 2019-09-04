import { Injectable, Next } from '@nestjs/common'
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
import nanoid from 'nanoid/generate'

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>) { }

  async getById(id: string): Promise<Room> {
    return this.roomRepository.findOne(id)
  }

  async getByCode(code: string): Promise<Room> {
    return this.roomRepository.findOne({ code })
  }

  async addTrack(trackDto: TrackDto, room: Room): Promise<Room> {
    const track = Track.createTrackFromDto(trackDto)
    room.playlist.push(track)
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
