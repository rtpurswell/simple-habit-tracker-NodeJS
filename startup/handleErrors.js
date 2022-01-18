//Handle any uncaught exceptions or rejected promisses and
//log them using winston

const config = require('config')
const winston = require('winston')

module.exports = function () {
  process.on('uncaughtException', (ex) => {
    winston.error(ex.message, ex)
    process.exit(1)
  })
  process.on('unhandledRejection', (ex) => {
    winston.error(ex.message, ex)
    process.exit(1)
  })
}
