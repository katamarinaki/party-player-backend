import ITokenPayload from '../interfaces/token-payload.interface'

export default class UserSessionDto {
  constructor(tokenPayload: ITokenPayload, socketID: string) {
    this.roomID = tokenPayload.roomID
    this.isAdmin = tokenPayload.isAdmin
    this.userID = tokenPayload.userID
    this.socketID = socketID
  }
  readonly roomID: string
  readonly userID: string
  readonly isAdmin: boolean
  readonly socketID: string
}
