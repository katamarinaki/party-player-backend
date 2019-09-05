import { Injectable, NotFoundException } from '@nestjs/common'
import { TrackDto } from './dto/track.dto'
import { Room } from '../room/room.entity'
import { Playlist } from './class/playlist.class'
import { Track } from './class/track.class'
import { TrackGateway } from './track.gateway'
import { RoomService } from '../room/room.service'

@Injectable()
export class TrackService {
  constructor(
    private readonly trackGateway: TrackGateway,
    private readonly roomService: RoomService,
  ) {}

  async addTrack(trackDto: TrackDto, room: Room): Promise<Playlist> {
    const track = new Track(trackDto)
    room.playlist.tracks.push(track)
    this.trackGateway.sendNewTrack(room.code, track)
    await this.roomService.save(room)
    return room.playlist
  }

  async likeTrack(trackID: string, room: Room): Promise<Playlist> {
    const likedTrack = room.playlist.tracks.find((track) => {
      return track.id === trackID
    })
    if (!likedTrack) {
      throw new NotFoundException('Track not found')
    }
    likedTrack.likes++
    this.trackGateway.sendLike(room.code, trackID)
    await this.roomService.save(room)
    return room.playlist
  }

  async dislikeTrack(trackID: string, room: Room): Promise<Playlist> {
    const dislikedTrack = room.playlist.tracks.find((track) => {
      return track.id === trackID
    })
    dislikedTrack.dislikes++
    if (!dislikedTrack) {
      throw new NotFoundException('Track not found')
    }
    this.trackGateway.sendDislike(room.code, trackID)
    await this.roomService.save(room)
    return room.playlist
  }

}
