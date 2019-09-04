import { IsNotEmpty, IsUrl } from 'class-validator'

export class TrackDto {
  id: string

  @IsNotEmpty()
  readonly name: string

  @IsNotEmpty()
  @IsUrl()
  readonly url: string
}
