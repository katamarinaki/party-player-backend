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
    this.trackGateway.sendNewTrack(room.code, room.playlist)
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
    room.playlist = this.sortPlaylist(room.playlist)
    this.trackGateway.sendLike(room.code, room.playlist)
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
    room.playlist = this.sortPlaylist(room.playlist)
    this.trackGateway.sendDislike(room.code, room.playlist)
    await this.roomService.save(room)
    return room.playlist
  }

  sortPlaylist(playlist: Playlist): Playlist {
    const sortedPlaylist = playlist
    sortedPlaylist.tracks.sort((trackA, trackB) => {
      if ((trackA.likes - trackA.dislikes) > (trackB.likes - trackB.dislikes)) {
        return 1
      } else if (trackA.likes > trackB.likes) {
        return 1
      } else if (trackA.dislikes < trackB.dislikes) {
        return 1
      }
      return -1
    })
    return sortedPlaylist
  }

}
