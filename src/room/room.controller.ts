import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { RoomService } from './room.service'
import { JoinRoomDto } from './dto/join-room.dto'
import nanoid from 'nanoid'
import { RoomContext } from './room.context'

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
  ) { }

  @Post('create')
  async createRoom(@Body() room: CreateRoomDto) {
    const userID = nanoid()
    const newRoom = await this.roomService.create(room, userID)
    return await this.roomService.generateToken(newRoom, userID, true)
  }

  @Post('join')
  async joinRoom(@Body() room: JoinRoomDto) {
    const userID = nanoid()
    const joinedRoom = await this.roomService.join(room, userID)
    if (joinedRoom) {
      return await this.roomService.generateToken(joinedRoom, userID, false)
    } else {
      throw new BadRequestException('Incorrect code or password')
    }
  }

  @Get()
  async getRoomByToken(@Body('context') ctx: RoomContext) {
    return this.roomService.parseRoom(ctx.room)
  }

  @Get(':code')
  async getRoomByCode(@Param() params: any) {
    const room = await this.roomService.getByCode(params.code)
    if (!room) {
      throw new NotFoundException('Room not found')
    }
    return this.roomService.parseRoom(room)
  }
}
