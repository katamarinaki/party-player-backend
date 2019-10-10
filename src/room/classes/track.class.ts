import TrackDto from '../dto/track.dto'
import nanoid from 'nanoid'
import IParsedTrack from '../interfaces/parsed-track.interface'

export default class Track {
  constructor(trackDto: TrackDto) {
    this.uuid = nanoid()
    this.id = trackDto.id
    this.title = trackDto.title
    this.channelTitle = trackDto.channelTitle
    this.thumbnailSrc = trackDto.thumbnailSrc
    this.likes = []
    this.dislikes = []
  }

  private readonly uuid: string
  private readonly id: string
  private readonly title: string
  private readonly channelTitle: string
  private readonly thumbnailSrc: string
  private readonly likes: string[]
  private readonly dislikes: string[]

  getUUID(): string {
    return this.uuid
  }

  getLikesCount(): number {
    return this.likes.length
  }

  getDislikesCount(): number {
    return this.dislikes.length
  }

  getParsedTrack(userID: string): IParsedTrack {
    const { uuid, id, title, channelTitle, thumbnailSrc } = this
    const likes = this.likes.length
    const dislikes = this.dislikes.length
    let voted = this.isLikedByUser(userID) ? 1 : 0
    voted = this.isDislikedByUser(userID) ? -1 : 0
    return {
      uuid,
      id,
      title,
      channelTitle,
      thumbnailSrc,
      likes,
      dislikes,
      voted,
    }
  }

  isLikedByUser(userID: string): boolean {
    return this.likes.includes(userID)
  }

  isDislikedByUser(userID: string): boolean {
    return this.dislikes.includes(userID)
  }

  like(userID: string) {
    this.likes.push(userID)
    const dislikeIndex = this.dislikes.indexOf(userID)
    if (dislikeIndex >= 0) {
      this.dislikes.splice(dislikeIndex, 1)
    }
  }

  dislike(userID: string) {
    this.dislikes.push(userID)
    const likeIndex = this.likes.indexOf(userID)
    if (likeIndex >= 0) {
      this.likes.splice(likeIndex, 1)
    }
  }
}
