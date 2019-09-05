import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { RoomModule } from './room/room.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'
import { RoomMiddleware } from './room/room.middleware'
import { RoomController } from './room/room.controller'
import { TrackController } from './track/track.controller'
import { TrackModule } from './track/track.module'

const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST } = process.env

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&useUnifiedTopology=true`,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      useNewUrlParser: true,
      synchronize: true,
    }),
    RoomModule,
    TrackModule,
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
      .forRoutes(RoomController, TrackController)
  }
}
