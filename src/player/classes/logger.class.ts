export default class Logger {
  static log(message: string) {
    const timeStamp = (new Date()).toDateString()
    console.log(`[${timeStamp}][LOG] ` + message)
  }

  static err(message: string) {
    const timeStamp = (new Date()).toDateString()
    console.log(`[${timeStamp}][ERR] ` + message)
  }
}
