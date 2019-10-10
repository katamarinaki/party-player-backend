import { Entity, Column, PrimaryColumn, ObjectIdColumn, ObjectID } from 'typeorm'
import UserSessionDto from '../dto/user-session.dto'

@Entity()
export default class UserSession {
  @ObjectIdColumn()
  private readonly id: ObjectID

  @PrimaryColumn()
  socketID: string

  @Column()
  roomID: string

  @Column()
  userID: string

  @Column()
  isAdmin: boolean

  generateFromDto(sessionDto: UserSessionDto) {
    this.socketID = sessionDto.socketID
    this.roomID = sessionDto.roomID
    this.userID = sessionDto.userID
    this.isAdmin = sessionDto.isAdmin
  }

}
