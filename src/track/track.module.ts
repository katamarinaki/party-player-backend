import { Module } from '@nestjs/common'
import { RoomModule } from '../room/room.module'
import { TrackController } from './track.controller'
import { TrackService } from './track.service'

@Module({
  imports: [RoomModule],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
