import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectID,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
} from 'typeorm'
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
  private readonly id: ObjectID

  @Column()
  private name: string

  @Column()
  private hashedPassword: string

  @Column({ unique: true })
  code: string

  @Column()
  private users: Array<{
    userID: string,
    connected: boolean,
  }>

  @Column()
  private playlist: Track[]

  @Column()
  private votesForSkip: string[]

  @CreateDateColumn()
  private createdAt: Timestamp

  @UpdateDateColumn()
  private updatedAt: Timestamp

  async generateFromDto(roomDto: CreateRoomDto) {
    this.code = nanoid('0123456789abcdefghopmn', 4)
    this.name = !roomDto.name || roomDto.name === '' ? `Room #${this.code}` : roomDto.name
    this.hashedPassword = await bcrypt.hash(!roomDto.password ? '' : roomDto.password, saltRounds)
    this.users = []
    this.playlist = []
    this.votesForSkip = []
  }

  getCode(): string {
    return this.code
  }

  getHashedPassword(): string {
    return this.hashedPassword
  }

  getVotesForSkip(): number {
    return this.votesForSkip.length
  }

  getActiveUsersCount() {
    return this.users.filter((user) => {
      return user.connected === true
    }).length
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
      return trackObject.getUUID() === trackUUID
    })
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

  addUser(userID: string) {
    this.users.push({
      userID,
      connected: false,
    })
  }

  addTrack(track: Track) {
    this.playlist.push(track)
  }

  addVoteToskip(userID: string) {
    const isVoted = this.votesForSkip.includes(userID)
    if (!isVoted) {
      this.votesForSkip.push(userID)
    } else {
      this.votesForSkip.splice(this.votesForSkip.indexOf(userID), 1)
    }
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
      if ((trackA.getLikesCount() - trackA.getDislikesCount()) > (trackB.getLikesCount() - trackB.getDislikesCount())) {
        return -1
      } else if (trackA.getLikesCount() > trackB.getLikesCount()) {
        return -1
      } else if (trackA.getDislikesCount() < trackB.getDislikesCount()) {
        return -1
      }
      return 1
    })
    this.playlist.unshift(firstTrack)
  }

  switchToNextTrack() {
    this.playlist.shift()
    this.votesForSkip = []
  }
}
