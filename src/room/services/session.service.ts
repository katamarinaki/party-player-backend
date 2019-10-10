import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import Room from '../entities/room.entity'
import { InjectRepository } from '@nestjs/typeorm'
import * as jwt from 'jsonwebtoken'
import UserSession from '../entities/user-session.entity'
import ITokenPayload from '../interfaces/token-payload.interface'
import UserSessionDto from '../dto/user-session.dto'
import RoomService from './room.service'
@Injectable()
export default class SessionService {
  constructor(
    private readonly roomService: RoomService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) { }

  async getSessionBySocketID(socketID: string): Promise<UserSession> {
    return await this.sessionRepository.findOne({ socketID })
  }

  decodeToken(token: string): ITokenPayload {
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET) as ITokenPayload
      return decodedToken
    } catch (error) {
      return null
    }
  }

  async createSession(userSessionDto: UserSessionDto): Promise<Room> {
    const { socketID, roomID, userID } = userSessionDto
    const room = await this.roomService.getRoomByID(roomID)
    if (!room) {
      return null
    }
    room.setUserConnection(userID, true)
    const savedRoom = await this.roomService.saveRoom(room)
    const currentSession = await this.sessionRepository.findOne({ socketID })
    if (!currentSession) {
      const userSession = new UserSession()
      userSession.generateFromDto(userSessionDto)
      await this.sessionRepository.save(userSession)
    }
    return savedRoom
  }

  async deleteSession(socketID: string): Promise<Room> {
    const userSession = await this.sessionRepository.findOne({ socketID })
    if (!userSession) {
      return null
    }
    const room = await this.roomService.getRoomByID(userSession.roomID)
    if (!room) {
      return null
    }
    room.setUserConnection(userSession.userID, false)
    const savedRoom = await this.roomService.saveRoom(room)
    await this.sessionRepository.delete({ socketID })
    return savedRoom
  }

  async verifySession(socketID: string): Promise<ITokenPayload> {
    const userSession = await this.sessionRepository.findOne({ socketID })
    if (!userSession) {
      return null
    }
    return userSession
  }
}
