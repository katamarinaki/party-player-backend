import { TrackDto } from '../dto/track.dto'
import nanoid from 'nanoid/generate'

export class Track {
  constructor(trackDto: TrackDto) {
    this.id = nanoid('0123456789', 4)
    this.name = trackDto.name
    this.url = trackDto.url
    this.likes = 0
    this.dislikes = 0
  }

  readonly id: string
  readonly name: string
  readonly url: string
  likes: number
  dislikes: number
}
