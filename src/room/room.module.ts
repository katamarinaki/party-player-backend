import { Module } from '@nestjs/common'
import { RoomController } from './room.controller'
import { RoomService } from './room.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from './room.entity'
import { PlayerGateway } from '../gateways/player.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
  ],
  controllers: [RoomController],
  providers: [RoomService, PlayerGateway],
  exports: [RoomService],
})
export class RoomModule {}
