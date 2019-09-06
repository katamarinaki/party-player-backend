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
    this.trackGateway.onPlaylistChanges(room.code, room.playlist)
    await this.roomService.save(room)
    return room.playlist
  }

  async likeTrack(trackID: string, userID: string, room: Room): Promise<boolean> {
    const track = room.playlist.tracks.find((trackObject) => {
      return trackObject.id === trackID
    })
    if (!track) {
      // throw new NotFoundException('Track not found')
      return false
    }
    const isLiked = track.likes.includes(userID)
    if (!isLiked) {
      track.likes.push(userID)
      const dislikeIndex = track.dislikes.indexOf(userID)
      if (dislikeIndex >= 0) {
        track.dislikes.splice(dislikeIndex, 1)
      }
      this.sortPlaylist(room.playlist)
      this.trackGateway.onPlaylistChanges(room.code, room.playlist)
      await this.roomService.save(room)
      return true
    }
    return false
  }

  async dislikeTrack(trackID: string, userID: string, room: Room): Promise<boolean> {
    const track = room.playlist.tracks.find((trackObject) => {
      return trackObject.id === trackID
    })
    if (!track) {
      // throw new NotFoundException('Track not found')
      return false
    }
    const isDisliked = track.likes.includes(userID)
    if (!isDisliked) {
      track.dislikes.push(userID)
      const likeIndex = track.dislikes.indexOf(userID)
      if (likeIndex >= 0) {
        track.likes.splice(likeIndex, 1)
      }
      this.sortPlaylist(room.playlist)
      this.trackGateway.onPlaylistChanges(room.code, room.playlist)
      await this.roomService.save(room)
      return true
    }
    return false
  }

  sortPlaylist(playlist: Playlist) {
    playlist.tracks.sort((trackA, trackB) => {
      if ((trackA.likes.length - trackA.dislikes.length) > (trackB.likes.length - trackB.dislikes.length)) {
        return 1
      } else if (trackA.likes.length > trackB.likes.length) {
        return 1
      } else if (trackA.dislikes.length < trackB.dislikes.length) {
        return 1
      }
      return -1
    })
  }

}
