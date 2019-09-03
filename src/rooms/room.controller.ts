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

@Controller('rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
  ) {}

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

  // @Put(':id')
  // async updateRoom(@Res() res, @Query('RoomID') roomID, @Body() createRoomDto: CreateRoomDto) {
  //   const updatedRoom = await this.roomService.updateRoom(roomID, createRoomDto);
  //   if (!updatedRoom) { throw new NotFoundException('Room does not exist'); }
  //   return res.status(HttpStatus.OK).json({
  //     message: 'Room updated',
  //     room: updatedRoom,
  //   });
  // }

  // @Delete(':id')
  // removeRoom(@Param('id') id: string) {
  //   return `This action removes a #${id} room`;
  // }
}
