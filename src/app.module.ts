import { Module } from '@nestjs/common'
import { RoomModule } from './room/room.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
const { DB_USERNAME, DB_PASSWORD, DB_HOST } = process.env

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/partyplayer?retryWrites=true&w=majority&useUnifiedTopology=true`,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      useNewUrlParser: true,
      synchronize: true,
    }),
    RoomModule,
  ],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(RoomMiddleware)
  //     .exclude(
  //       { path: 'rooms/create', method: RequestMethod.POST },
  //       { path: 'rooms/join', method: RequestMethod.POST },
  //       { path: 'rooms/:code', method: RequestMethod.GET },
  //     )
  //     .forRoutes(RoomController, TrackController)
  // }
}
