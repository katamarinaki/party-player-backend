import { IsNotEmpty } from 'class-validator'

export class JoinRoomDto {
  @IsNotEmpty()
  readonly code: string

  readonly password: string
}
