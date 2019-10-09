import { Entity, Column, PrimaryColumn } from 'typeorm'
import { UserSessionDto } from '../dto/user-session.dto';

@Entity()
export class UserSession {

  @PrimaryColumn()
  socketID: string

  @Column()
  roomID: string

  @Column()
  userID: string

  @Column()
  isAdmin: boolean

  static createFromDto(sessionDto: UserSessionDto): UserSession {
    const createdSession = new UserSession()
    createdSession.socketID = sessionDto.socketID
    createdSession.roomID = sessionDto.roomID
    createdSession.userID = sessionDto.userID
    createdSession.isAdmin = sessionDto.isAdmin
    return createdSession
  }

}
