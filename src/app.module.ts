import { Module } from '@nestjs/common'
import PlayerModule from './player/player.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import Room from './player/entities/room.entity'
import UserSession from './player/entities/user-session.entity'
const { DB_USERNAME, DB_PASSWORD, DB_HOST } = process.env

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/partyplayer?retryWrites=true&w=majority&useUnifiedTopology=true`,
      entities: [Room, UserSession],
      useNewUrlParser: true,
      synchronize: true,
    }),
    PlayerModule,
  ],
})
export default class AppModule {
  constructor(private readonly connection: Connection) {}
}
