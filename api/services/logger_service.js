const winston = require('winston')
const cloudLog = require('../services/cloud_watch_service')
require('winston-daily-rotate-file');
dateFormat = () => {
  return new Date(Date.now()).toUTCString()
}
var transport = new winston.transports.DailyRotateFile({
    filename:  `./log/`+'%DATE%.log'+`.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true
  });
class LoggerService {
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
        let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${route}.log | ${info.message} | `
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
  // cloudLog.clouderrorLog(message);
}
async info(message, obj) {
  this.logger.log('info', message, {
    obj
  })
//  cloudLog.clouderrorLog(message);
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
  // cloudLog.clouderrorLog(message);
}
async error(message, obj) {
  this.logger.log('error', message, {
    obj
  })
  // cloudLog.clouderrorLog(message);
}
}
module.exports = LoggerService