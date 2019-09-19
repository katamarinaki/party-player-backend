import { Module } from '@nestjs/common'
import { RoomModule } from '../room/room.module'
import { TrackController } from './track.controller'
import { TrackService } from './track.service'
import { PlayerGateway } from '../gateways/player.gateway'

@Module({
  imports: [RoomModule],
  controllers: [TrackController],
  providers: [TrackService, PlayerGateway],
})
export class TrackModule {}
