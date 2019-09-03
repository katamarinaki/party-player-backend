import { IsNotEmpty } from 'class-validator'

export class JoinRoomDto {
  @IsNotEmpty()
  public readonly code: string

  public readonly password: string
}
