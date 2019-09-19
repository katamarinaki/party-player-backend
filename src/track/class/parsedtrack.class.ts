import { Track } from './track.class'

export class ParsedTrack {
  constructor(track: Track) {
    this.id = track.id
    this.title = track.title
    this.channelTitle = track.channelTitle
    this.thumbnailSrc = track.thumbnailSrc
    this.likes = track.likes.length
    this.dislikes = track.dislikes.length
  }
  readonly id: string
  readonly title: string
  readonly channelTitle: string
  readonly thumbnailSrc: string
  likes: number
  dislikes: number

}
