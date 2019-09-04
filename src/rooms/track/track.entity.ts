import { Entity, Column, PrimaryColumn, Generated } from 'typeorm'
import { TrackDto } from './track.dto'
import nanoid from 'nanoid/generate'

@Entity()
export class Track {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column()
  url: string

  @Column()
  likes: number

  @Column()
  dislikes: number

  static createTrackFromDto(trackDto: TrackDto): Track {
    const createdTrack = new Track()
    createdTrack.id = nanoid('0123456789', 4)
    createdTrack.name = trackDto.name
    createdTrack.url = trackDto.url
    createdTrack.likes = 0
    createdTrack.dislikes = 0
    return createdTrack
  }
}
