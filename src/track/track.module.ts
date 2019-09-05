import { Module } from '@nestjs/common'
import { RoomModule } from '../room/room.module'
import { TrackController } from './track.controller'
import { TrackService } from './track.service'
import { TrackGateway } from './track.gateway'

@Module({
  imports: [RoomModule],
  controllers: [TrackController],
  providers: [TrackService, TrackGateway],
})
export class TrackModule {}
