import { Track } from './track.class'

export class ParsedTrack {
  constructor(track: Track, userID: string) {
    this.uuid = track.uuid
    this.id = track.id
    this.title = track.title
    this.channelTitle = track.channelTitle
    this.thumbnailSrc = track.thumbnailSrc
    this.likes = track.likes.length
    this.dislikes = track.dislikes.length
    this.voted = 0
    if (track.likes.includes(userID)) {
      this.voted = 1
    } else if (track.dislikes.includes(userID)) {
      this.voted = -1
    }
  }

  readonly uuid: string
  readonly id: string
  readonly title: string
  readonly channelTitle: string
  readonly thumbnailSrc: string
  readonly likes: number
  readonly dislikes: number
  readonly voted: number
}
