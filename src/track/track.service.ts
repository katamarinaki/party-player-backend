import { Injectable, NotFoundException } from '@nestjs/common'
import { TrackDto } from './dto/track.dto'
import { Room } from '../room/room.entity'
import { Track } from './class/track.class'
import { PlayerGateway } from '../gateways/player.gateway'
import { RoomService } from '../room/room.service'

@Injectable()
export class TrackService {
  constructor(
    private readonly playerGateway: PlayerGateway,
    private readonly roomService: RoomService,
  ) { }

  async addTrack(trackDto: TrackDto, room: Room): Promise<boolean> {
    const track = new Track(trackDto)
    room.playlist.push(track)
    const savedRoom = await this.roomService.save(room)
    if (savedRoom) {
      this.playerGateway.onPlaylistChange(room.code, room.playlist)
      return true
    }
    return false
  }

  async likeTrack(trackID: string, userID: string, room: Room): Promise<boolean> {
    const track = room.playlist.find((trackObject) => {
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
      const savedRoom = await this.roomService.save(room)
      if (savedRoom) {
        this.playerGateway.onPlaylistChange(room.code, room.playlist)
        return true
      }
    }
    return false
  }

  async dislikeTrack(trackID: string, userID: string, room: Room): Promise<boolean> {
    const track = room.playlist.find((trackObject) => {
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
      const savedRoom = await this.roomService.save(room)
      if (savedRoom) {
        this.playerGateway.onPlaylistChange(room.code, room.playlist)
        return true
      }
    }
    return false
  }

  sortPlaylist(playlist: Track[]) {
    const newPlaylist = playlist
    const firstTrack = newPlaylist.shift()
    newPlaylist.sort((trackA, trackB) => {
      if ((trackA.likes.length - trackA.dislikes.length) > (trackB.likes.length - trackB.dislikes.length)) {
        return 1
      } else if (trackA.likes.length > trackB.likes.length) {
        return 1
      } else if (trackA.dislikes.length < trackB.dislikes.length) {
        return 1
      }
      return -1
    })
    newPlaylist.unshift(firstTrack)
    return newPlaylist
  }

  async playNextTrack(room: Room): Promise<boolean> {
    room.playlist.shift()
    if (!room.playlist.length) {
      this.sortPlaylist(room.playlist)
    }
    room.votesForSkip = []
    const savedRoom = await this.roomService.save(room)
    if (savedRoom) {
      this.playerGateway.onVoteSkipChange(room.code, 0)
      this.playerGateway.onPlaylistChange(room.code, room.playlist)
      return true
    }
    return false
  }

}
