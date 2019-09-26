import { Controller, Body, Post, Get, BadRequestException, UseGuards } from '@nestjs/common'
import { TrackService } from './track.service'
import { RoomContext } from '../room/room.context'
import { TrackDto } from './dto/track.dto'
import { AdminGuard } from '../guards/admin.guard'

@Controller('tracks')
export class TrackController {
  constructor(
    private readonly trackService: TrackService,
  ) { }

  @Post('add')
  async addTrack(@Body() trackDto: TrackDto, @Body('context') ctx: RoomContext) {
    const trackAdded = await this.trackService.add(trackDto, ctx.userID, ctx.room)
    if (!trackAdded) {
      throw new BadRequestException('add track error')
    }
  }

  @Post('like')
  async likeTrack(@Body('trackUUID') trackUUID: string, @Body('context') ctx: RoomContext) {
    const trackLiked = await this.trackService.like(trackUUID, ctx.userID, ctx.room)
    if (!trackLiked) {
      throw new BadRequestException('like track error')
    }
  }

  @Post('dislike')
  async dislikeTrack(@Body('trackUUID') trackUUID: string, @Body('context') ctx: RoomContext) {
    const trackDisliked = await this.trackService.dislike(trackUUID, ctx.userID, ctx.room)
    if (!trackDisliked) {
      throw new BadRequestException('dislike track error')
    }
  }

  @Get()
  async getPlaylist(@Body('context') ctx: RoomContext) {
    return ctx.room.playlist
  }

  @Get('next')
  @UseGuards(AdminGuard)
  async playNextTrack(@Body('context') ctx: RoomContext) {
    const trackChanged = this.trackService.playNextTrack(ctx.room, ctx.userID)
    if (!trackChanged) {
      throw new BadRequestException('next track error')
    }
  }

  @Post('voteforskip')
  async voteForSkip(@Body('context') ctx: RoomContext) {
    const { room, userID } = ctx
    return this.trackService.voteForSkip(room, userID)
  }
}
