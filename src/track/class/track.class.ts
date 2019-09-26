import { TrackDto } from '../dto/track.dto'
import nanoid from 'nanoid'

export class Track {
  constructor(trackDto: TrackDto) {
    this.uuid = nanoid()
    this.id = trackDto.id
    this.title = trackDto.title
    this.channelTitle = trackDto.channelTitle
    this.thumbnailSrc = trackDto.thumbnailSrc
    this.likes = []
    this.dislikes = []
  }

  readonly uuid: string
  readonly id: string
  readonly title: string
  readonly channelTitle: string
  readonly thumbnailSrc: string
  likes: string[]
  dislikes: string[]
}
