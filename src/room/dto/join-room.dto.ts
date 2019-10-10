import { IsNotEmpty } from 'class-validator'

export default class JoinRoomDto {
  @IsNotEmpty()
  readonly code: string
  readonly password: string
}
