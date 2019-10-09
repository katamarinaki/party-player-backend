import { ParsedTrack } from './parsedtrack.class'
import { Room } from '../entities/room.entity'

export default class ParsedRoom {
  constructor(room: Room, userID: string) {
    this.name = room.name
    this.code = room.code
    this.users = room.getActiveUsersCount()
    this.playlist = room.playlist.map(track => {
      return new ParsedTrack(track, userID)
    })
    this.voteskips = room.votesForSkip.length
  }
  name: string
  code: string
  users: number
  playlist: ParsedTrack[]
  voteskips: number
}
