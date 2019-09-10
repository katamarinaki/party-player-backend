import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common'
import { Request, Response } from 'express'
import { RoomService } from './room.service'
import { ForbiddenException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { ITokenPayload } from './token/token.interface'

@Injectable()
export class RoomMiddleware implements NestMiddleware {
  constructor(
    private readonly roomService: RoomService,
  ) {}
  async use(req: Request, res: Response, next: () => void) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if (!token) {
      throw new ForbiddenException('Token not found')
    }
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET) as ITokenPayload
      const { roomID, userID, isAdmin } = decodedToken
      const room = await this.roomService.getById(roomID)
      if (!room) {
        throw new NotFoundException('Invalid Room ID')
      }
      req.body.context = {
        room,
        userID,
        isAdmin: isAdmin || false,
      }
      next()
    } catch (error) {
      throw new ForbiddenException('Invalid token')
    }
  }
}
