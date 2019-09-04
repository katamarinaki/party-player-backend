import { Module } from '@nestjs/common'
import { RoomController } from './room.controller'
import { RoomService } from './room.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from './room.entity'
import { EventsGateway } from './room.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
  ],
  controllers: [RoomController],
  providers: [RoomService, EventsGateway],
  exports: [RoomService],
})
export class RoomModule {}
