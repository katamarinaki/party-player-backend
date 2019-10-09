import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm'
import { CreateRoomDto } from '../dto/create-room.dto'
import nanoid from 'nanoid/generate'
import * as bcrypt from 'bcrypt'
import { Track } from '../classes/track.class'

const saltRounds = 10

@Entity()
export class Room {

  @ObjectIdColumn()
  id: ObjectID

  @Column()
  name: string

  @Column()
  password: string

  @Column({ unique: true })
  code: string

  @Column()
  users: Array<{
    userID: string,
    connected: boolean,
  }>

  @Column()
  playlist: Track[]

  @Column()
  votesForSkip: string[]

  static async createFromDto(dtoRoom: CreateRoomDto): Promise<Room> {
    const createdRoom = new Room()
    createdRoom.code = nanoid('0123456789abcdefghopmn', 4)
    createdRoom.name = !dtoRoom.name || dtoRoom.name === '' ? `Room ${createdRoom.code}` : dtoRoom.name
    createdRoom.password = await bcrypt.hash(!dtoRoom.password ? '' : dtoRoom.password, saltRounds)
    createdRoom.users = []
    createdRoom.playlist = []
    createdRoom.votesForSkip = []
    return createdRoom
  }

  getActiveUsersCount() {
    return this.users.filter((user) => {
      return user.connected === true
    }).length
  }
}
