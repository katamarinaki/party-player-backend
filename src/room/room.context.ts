import { Room } from './room.entity'

export class RoomContext {
  readonly room: Room
  readonly userID: string
  readonly isAdmin: boolean
}
