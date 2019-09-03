import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { RoomModule } from './rooms/room.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { RoomMiddleware } from './rooms/room.middleware'
import { RoomController } from './rooms/room.controller'

const dbUsername = 'admin'
const dbPassword = 'gw55rs55'
const dbName = 'partyplayer'
const dbHost = 'cluster0-illl5.mongodb.net'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://${dbUsername}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority&useUnifiedTopology=true`,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      useNewUrlParser: true,
      synchronize: true,
    }),
    RoomModule,
  ],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RoomMiddleware)
      .exclude(
        { path: 'rooms/create', method: RequestMethod.POST },
        { path: 'rooms/join', method: RequestMethod.POST },
      )
      .forRoutes(RoomController)
  }
}
