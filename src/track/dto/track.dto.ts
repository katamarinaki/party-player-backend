import { IsNotEmpty, IsUrl } from 'class-validator'

export class TrackDto {
  readonly id: string

  @IsNotEmpty()
  readonly name: string

  @IsNotEmpty()
  @IsUrl()
  readonly url: string
}
