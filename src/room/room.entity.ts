import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm'
import { Exclude } from 'class-transformer'
import { CreateRoomDto } from './dto/create-room.dto'
import nanoid from 'nanoid/generate'
import * as bcrypt from 'bcrypt'
import { Playlist } from '../track/class/playlist.class'

const saltRounds = 10

@Entity()
export class Room {

  @ObjectIdColumn()
  @Exclude()
  id: ObjectID

  @Column()
  name: string

  @Column()
  @Exclude()
  password: string

  @Column({ unique: true })
  code: string

  @Column()
  users: string[]

  @Column()
  playlist: Playlist

  static async createRoomFromDto(dtoRoom: CreateRoomDto): Promise<Room> {
    const createdRoom = new Room()
    createdRoom.code = nanoid('0123456789abcdefghopmn', 4)
    createdRoom.name = !dtoRoom.name || dtoRoom.name === '' ? `Room ${createdRoom.code}` : dtoRoom.name
    createdRoom.password = await bcrypt.hash(!dtoRoom.password ? '' : dtoRoom.password, saltRounds)
    createdRoom.users = []
    createdRoom.playlist = new Playlist([])
    return createdRoom
  }
}
