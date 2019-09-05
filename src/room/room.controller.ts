import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { RoomService } from './room.service'
import { JoinRoomDto } from './dto/join-room.dto'
import nanoid from 'nanoid'
import { Room } from './room.entity'
import { TrackDto } from './track/track.dto'
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
    return await this.roomService.generateToken(newRoom, userID)
  }

  @Post('join')
  async joinRoom(@Body() room: JoinRoomDto) {
    const userID = nanoid()
    const joinedRoom = await this.roomService.join(room, userID)
    if (joinedRoom) {
      return await this.roomService.generateToken(joinedRoom, userID)
    } else {
      throw new BadRequestException('Incorrect code or password')
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async getRoom(@Body('room') room: Room) {
    return room
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('add_track')
  async addTrack(@Body() trackDto: TrackDto, @Body('context') ctx: RoomContext) {
    await this.roomService.addTrack(trackDto, ctx.room)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('like_track')
  async likeTrack(@Body('trackID') trackID: string, @Body() ctx: RoomContext) {
    await this.roomService.likeTrack(trackID, ctx.room)
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('dislike_track')
  async dislikeTrack(@Body('trackID') trackID: string, @Body() ctx: RoomContext) {
    await this.roomService.dislikeTrack(trackID, ctx.room)
  }
}
