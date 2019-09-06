import { Controller, Body, Post, Get } from '@nestjs/common'
import { TrackService } from './track.service'
import { RoomContext } from '../room/room.context'
import { TrackDto } from './dto/track.dto'

@Controller('tracks')
export class TrackController {
  constructor(
    private readonly trackService: TrackService,
  ) { }

  @Post('add')
  async addTrack(@Body() trackDto: TrackDto, @Body('context') ctx: RoomContext) {
    return await this.trackService.addTrack(trackDto, ctx.room)
  }

  @Post('like')
  async likeTrack(@Body('trackID') trackID: string, @Body('context') ctx: RoomContext) {
    return await this.trackService.likeTrack(trackID, ctx.userID, ctx.room)
  }

  @Post('dislike')
  async dislikeTrack(@Body('trackID') trackID: string, @Body('context') ctx: RoomContext) {
    return await this.trackService.dislikeTrack(trackID, ctx.userID, ctx.room)
  }

  // @Get('next_track')
  // async playNextTrack(@Body() ctx: RoomContext) {
  //   this.trackService.playNextTrack(ctx.room.playlist)
  // }
}
