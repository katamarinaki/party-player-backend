import { Track } from './track.class'

export class Playlist {
  constructor(tracks: Track[]) {
    this.tracks = tracks
  }
  tracks: Track[]
}
