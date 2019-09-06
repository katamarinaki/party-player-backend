import { ParsedTrack } from './parsedtrack.class'
import { Playlist } from './playlist.class'

export class ParsedPlaylist {
  constructor(playlist: Playlist) {
    this.tracks = playlist.tracks.map((track) => {
      return new ParsedTrack(track)
    })
  }
  tracks: ParsedTrack[]
}
