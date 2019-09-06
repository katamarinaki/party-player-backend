import { Controller, Body, Post, Get, BadRequestException } from '@nestjs/common'
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
    const trackAdded = await this.trackService.addTrack(trackDto, ctx.room)
    if (!trackAdded) {
      throw new BadRequestException('add track error')
    }
  }

  @Post('like')
  async likeTrack(@Body('trackID') trackID: string, @Body('context') ctx: RoomContext) {
    const trackLiked = await this.trackService.likeTrack(trackID, ctx.userID, ctx.room)
    if (!trackLiked) {
      throw new BadRequestException('like track error')
    }
  }

  @Post('dislike')
  async dislikeTrack(@Body('trackID') trackID: string, @Body('context') ctx: RoomContext) {
    const trackDisliked = await this.trackService.dislikeTrack(trackID, ctx.userID, ctx.room)
    if (!trackDisliked) {
      throw new BadRequestException('dislike track error')
    }
  }

  @Get('next')
  async playNextTrack(@Body() ctx: RoomContext) {
    const trackChanged = this.trackService.playNextTrack(ctx.room)
    if (!trackChanged) {
      throw new BadRequestException('next track error')
    }
  }
}
