import { Injectable } from '@nestjs/common'
import Room from '../entities/room.entity'
import { InjectRepository } from '@nestjs/typeorm'
import TrackDto from '../dto/track.dto'
import Track from '../classes/track.class'
import RoomService from './room.service'
import IParsedTrack from '../interfaces/parsed-track.interface'

@Injectable()
export default class PlaylistService {
  constructor(
    @InjectRepository(Room)
    private readonly roomService: RoomService,
  ) { }

  async addTrack(room: Room, userID: string, trackDto: TrackDto): Promise<IParsedTrack[]> {
    const track = new Track(trackDto)
    room.addTrack(track)
    const savedRoom = await this.roomService.saveRoom(room)
    return savedRoom.getParsedRoom(userID).playlist
  }

  async likeTrack(room: Room, userID: string, trackUUID: string): Promise<IParsedTrack[]> {
    const track = room.getTrackByUUID(trackUUID)
    if (!track) {
      return null
    }
    const isLiked = track.isLikedByUser(userID)
    if (!isLiked) {
      track.like(userID)
      room.sortPlaylist()
      const savedRoom = await this.roomService.saveRoom(room)
      return savedRoom.getParsedRoom(userID).playlist
    } else {
      return room.getParsedRoom(userID).playlist
    }
  }

  async dislikeTrack(room: Room, userID: string, trackUUID: string): Promise<IParsedTrack[]> {
    const track = room.getTrackByUUID(trackUUID)
    if (!track) {
      return null
    }
    const isDisliked = track.isDislikedByUser(userID)
    if (!isDisliked) {
      track.dislike(userID)
      room.sortPlaylist()
      const savedRoom = await this.roomService.saveRoom(room)
      return savedRoom.getParsedRoom(userID).playlist
    } else {
      return room.getParsedRoom(userID).playlist
    }
  }

  async playNextTrack(room: Room, userID: string): Promise<IParsedTrack[]> {
    room.switchToNextTrack()
    const savedRoom = await this.roomService.saveRoom(room)
    if (!savedRoom) {
      return null
    }
    return room.getParsedRoom(userID).playlist
  }
}
