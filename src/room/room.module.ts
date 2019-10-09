import { Module } from '@nestjs/common'
import { RoomService } from './room.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from './entities/room.entity'
import { RoomGateway } from './room.gateway'
import { UserSession } from './entities/user-session.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, UserSession]),
  ],
  providers: [RoomService, RoomGateway],
})
export class RoomModule {}
