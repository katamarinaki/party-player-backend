import { IsNotEmpty, IsUrl } from 'class-validator'

export class TrackDto {

  @IsNotEmpty()
  readonly name: string

  @IsNotEmpty()
  @IsUrl()
  readonly url: string
}
