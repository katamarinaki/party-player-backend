import { ParsedTrack } from '../track/class/parsedtrack.class'
import { Room } from './room.entity'

export default class ParsedRoom {
  constructor(room: Room, userID: string) {
    this.name = room.name
    this.code = room.code
    this.users = room.users.length
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
