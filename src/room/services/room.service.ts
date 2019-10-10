import { Injectable } from '@nestjs/common'
import CreateRoomDto from '../dto/create-room.dto'
import { Repository } from 'typeorm'
import Room from '../entities/room.entity'
import * as bcrypt from 'bcrypt'
import JoinRoomDto from '../dto/join-room.dto'
import { InjectRepository } from '@nestjs/typeorm'
@Injectable()
export default class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) { }

  async getRoomByID(roomID: string): Promise<Room> {
    return await this.roomRepository.findOne(roomID)
  }

  async saveRoom(room: Room): Promise<Room> {
    return await this.roomRepository.save(room)
  }

  async createRoom(roomDto: CreateRoomDto, userID: string): Promise<Room> {
    const createdRoom = new Room()
    createdRoom.generateFromDto(roomDto)
    createdRoom.addUser(userID)
    return await this.roomRepository.save(createdRoom)
  }

  async joinRoom(joinRoomDto: JoinRoomDto, userID: string): Promise<Room> {
    const { code, password } = joinRoomDto
    const joinedRoom = await this.roomRepository.findOne({ code })
    if (joinedRoom) {
      const passwordsMatches = await bcrypt.compare(!password ? '' : password, joinedRoom.getHashedPassword())
      if (passwordsMatches) {
        joinedRoom.addUser(userID)
        return await this.roomRepository.save(joinedRoom)
      }
    }
    return null
  }

  async voteForSkipInRoom(room: Room, userID: string): Promise<number> {
    room.addVoteToskip(userID)
    await this.roomRepository.save(room)
    return room.getVotesForSkip()
  }
}
