import { Injectable } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { Repository } from 'typeorm'
import { Room } from './room.entity'
import * as bcrypt from 'bcrypt'
import { JoinRoomDto } from './dto/join-room.dto'
import { InjectRepository } from '@nestjs/typeorm'
import * as jwt from 'jsonwebtoken'
import { AccessToken } from './token/token.class'
@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) { }

  async getById(id: string): Promise<Room> {
    return this.roomRepository.findOne(id)
  }

  async getByCode(code: string): Promise<Room> {
    return this.roomRepository.findOne({ code })
  }

  async addUserAndSave(room: Room, userID: string): Promise<Room> {
    room.users.push(userID)
    return await this.roomRepository.save(room)
  }

  async generateToken(room: Room, userID: string, isAdmin: boolean): Promise<AccessToken> {
    const roomCode = room.code
    const accessToken = jwt.sign({
      roomID: room.id,
      isAdmin,
      userID,
    }, process.env.TOKEN_SECRET)
    return { accessToken, roomCode }
  }

  async create(room: CreateRoomDto, userID: string): Promise<Room> {
    const createdRoom = await Room.createRoomFromDto(room)
    return await this.addUserAndSave(createdRoom, userID)
  }

  async join(joinRoomDto: JoinRoomDto, userID: string): Promise<Room> {
    const { code, password } = joinRoomDto
    const room = await this.getByCode(code)
    if (room) {
      const passwordsMatches = await bcrypt.compare(!password ? '' : password, room.password)
      if (passwordsMatches) {
        return await this.addUserAndSave(room, userID)
      }
    }
    return null
  }

  async save(room: Room): Promise<Room> {
    return await this.roomRepository.save(room)
  }
}
