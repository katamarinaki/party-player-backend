import { Module } from '@nestjs/common'
import RoomService from './services/room.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import Room from './entities/room.entity'
import UserSession from './entities/user-session.entity'
import SessionService from './services/session.service'
import PlaylistService from './services/playlist.service'
import PlayerGateway from './player.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, UserSession]),
  ],
  providers: [RoomService, PlayerGateway, SessionService, PlaylistService],
})
export default class PlayerModule {}
