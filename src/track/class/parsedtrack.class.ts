import { Track } from './track.class'

export class ParsedTrack {
  constructor(track: Track) {
    this.id = track.id
    this.name = track.name
    this.url = track.url
    this.likes = track.likes.length
    this.dislikes = track.dislikes.length
  }
  readonly id: string
  readonly name: string
  readonly url: string
  likes: number
  dislikes: number

}
