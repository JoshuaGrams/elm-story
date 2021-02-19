import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  silent: process.env.NODE_ENV === 'production',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
})

export default logger
