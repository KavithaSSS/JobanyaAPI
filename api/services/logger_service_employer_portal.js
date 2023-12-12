const winston = require('winston')
require('winston-daily-rotate-file');
dateFormat = () => {
  return new Date(Date.now()).toUTCString()
}
var transport = new winston.transports.DailyRotateFile({
    filename:  `./employer_portal_log/`+'%DATE%.log'+`.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true
  });
class LoggerServiceEmployerPortal {
  constructor(route) {
    this.log_data = null
    this.route = route
    const logger = winston.createLogger({
      transports: [
        // new winston.transports.Console(),
        // new winston.transports.File({
        //  // filename: `./log/${route}.log`
        //  filename: `./log/`+new Date(Date.now()).toUTCString()+`.log`
        // })
        transport
      ],
      format: winston.format.printf((info) => {
        let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${route}.employer_portal_error | ${info.message} | `
        message = info.obj ? message + `data:${JSON.stringify(info.obj)} | ` : message
        message = this.log_data ? message + `log_data:${JSON.stringify(this.log_data)} | ` : message
        return message
      })
   });
   this.logger = logger
}
setLogData(log_data) {
  this.log_data = log_data
}
async info(message) {
  this.logger.log('info', message);
}
async info(message, obj) {
  this.logger.log('info', message, {
    obj
  })
}
async debug(message) {
  this.logger.log('debug', message);
}
async debug(message, obj) {
  this.logger.log('debug', message, {
    obj
  })
}
async error(message) {
  this.logger.log('error', message);
}
async error(message, obj) {
  this.logger.log('error', message, {
    obj
  })
}
}
module.exports = LoggerServiceEmployerPortal