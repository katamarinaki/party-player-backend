import Logger from './logger.class'

export default class Response {
  constructor(event: string) {
    this.event = event
    this.data = null
    this.errorMessage = null
  }

  throwError(message: string): Response {
    this.errorMessage = message
    Logger.err(message)
    return this
  }

  sendData(data: object): Response {
    this.data = {
      ...data,
    }
    return this
  }

  private readonly event: string
  private data: object
  private errorMessage: string
}
