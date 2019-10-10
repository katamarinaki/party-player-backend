export default interface IParsedTrack {
  readonly uuid: string
  readonly id: string
  readonly title: string
  readonly channelTitle: string
  readonly thumbnailSrc: string
  readonly likes: number
  readonly dislikes: number
  readonly voted: number
}
