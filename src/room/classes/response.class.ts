export default class Response {
  constructor(event: string) {
    this.event = event
    this.data = null
    this.error = false
    this.errorMessage = ''
  }

  setErrorMessage(message: string) {
    this.error = true
    this.errorMessage = message
  }

  setData(data: object) {
    this.error = false
    this.errorMessage = ''
    this.data = {
      ...data,
    }
  }

  private readonly event: string
  private data: object
  private error: boolean
  private errorMessage: string
}
