import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm'
import CreateRoomDto from '../dto/create-room.dto'
import nanoid from 'nanoid/generate'
import * as bcrypt from 'bcrypt'
import Track from '../classes/track.class'
import * as jwt from 'jsonwebtoken'
import IParsedTrack from '../interfaces/parsed-track.interface'
import IParsedRoom from '../interfaces/parsed-room.interface'

const saltRounds = 10

@Entity()
export default class Room {

  @ObjectIdColumn()
  readonly id: ObjectID

  @Column()
  name: string

  @Column()
  password: string

  @Column({ unique: true })
  code: string

  @Column()
  users: Array<{
    userID: string,
    connected: boolean,
  }>

  @Column()
  playlist: Track[]

  @Column()
  votesForSkip: string[]

  async generateFromDto(roomDto: CreateRoomDto) {
    this.code = nanoid('0123456789abcdefghopmn', 4)
    this.name = !roomDto.name || roomDto.name === '' ? `Room #${this.code}` : roomDto.name
    this.password = await bcrypt.hash(!this.password ? '' : this.password, saltRounds)
    this.users = []
    this.playlist = []
    this.votesForSkip = []
  }

  getActiveUsersCount() {
    return this.users.filter((user) => {
      return user.connected === true
    }).length
  }

  setUserConnection(userID: string, isConnected: boolean): boolean {
    const userRecord = this.users.find((record) => {
      return record.userID === userID
    })
    if (userRecord) {
      userRecord.connected = isConnected
      return true
    }
    return false
  }

  getParsedRoom(userID: string): IParsedRoom {
    const { name, code } = this
    const users = this.getActiveUsersCount()
    const playlist = this.getParsedPlaylist(userID)
    const voteskips = this.votesForSkip.length
    return {
      name,
      code,
      users,
      playlist,
      voteskips,
    }
  }

  getParsedPlaylist(userID): IParsedTrack[] {
    return this.playlist.map(track => {
      return track.getParsedTrack(userID)
    })
  }

  getTrackByUUID(trackUUID: string): Track {
    return this.playlist.find((trackObject) => {
      return trackObject.uuid === trackUUID
    })
  }

  addUser(userID: string) {
    this.users.push({
      userID,
      connected: false,
    })
  }

  generateTokenForUser(userID: string, isAdmin: boolean): string {
    const accessToken = jwt.sign({
      roomID: this.id,
      isAdmin,
      userID,
    }, process.env.TOKEN_SECRET)
    return accessToken
  }

  sortPlaylist() {
    const firstTrack = this.playlist.shift()
    this.playlist.sort((trackA, trackB) => {
      if ((trackA.likes.length - trackA.dislikes.length) > (trackB.likes.length - trackB.dislikes.length)) {
        return -1
      } else if (trackA.likes.length > trackB.likes.length) {
        return -1
      } else if (trackA.dislikes.length < trackB.dislikes.length) {
        return -1
      }
      return 1
    })
    this.playlist.unshift(firstTrack)
  }

  addTrack(track: Track) {
    this.playlist.push(track)
  }

  switchToNextTrack() {
    this.playlist.shift()
    this.votesForSkip = []
  }
}
