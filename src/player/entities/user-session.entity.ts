import {
  Entity,
  Column,
  PrimaryColumn,
  ObjectIdColumn,
  ObjectID,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
} from 'typeorm'
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

  @CreateDateColumn()
  private createdAt: Timestamp

  getRoomID(): string {
    return this.roomID
  }

  generateFromDto(sessionDto: UserSessionDto) {
    this.socketID = sessionDto.socketID
    this.roomID = sessionDto.roomID
    this.userID = sessionDto.userID
    this.isAdmin = sessionDto.isAdmin
  }

}
