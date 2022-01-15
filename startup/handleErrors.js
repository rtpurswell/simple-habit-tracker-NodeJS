//Handle any uncaught exceptions or rejected promisses and
//log them using winston

const config = require('config')
const winston = require('winston')

module.exports = function () {
  if (!config.get('jwtPrivateKey')) {
    console.error(
      'FATAL ERROR: You must set enviornment variable bobs_jwtPrivateKey to set the private key for JWT authentication',
    )
    process.exit(1)
  }

  process.on('uncaughtException', (ex) => {
    winston.error(ex.message, ex)
    process.exit(1)
  })
  process.on('unhandledRejection', (ex) => {
    winston.error(ex.message, ex)
    process.exit(1)
  })
}
