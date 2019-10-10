import IParsedTrack from '../interfaces/parsed-track.interface'

export default interface IParsedRoom {
  readonly name: string
  readonly code: string
  readonly users: number
  readonly playlist: IParsedTrack[]
  readonly voteskips: number
}
