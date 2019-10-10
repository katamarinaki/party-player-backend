import { IsNotEmpty, IsUrl } from 'class-validator'

export default class TrackDto {

  @IsNotEmpty()
  readonly id: string

  @IsNotEmpty()
  readonly title: string

  @IsNotEmpty()
  readonly channelTitle: string

  @IsUrl()
  readonly thumbnailSrc: string
}
