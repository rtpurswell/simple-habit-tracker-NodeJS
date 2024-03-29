const winston = require('winston')
require('winston-mongodb')
const config = require('config')

const connectionString = `${config.get('db.protocall')}://${config.get(
  'db.username',
)}:${config.get('db.password')}@${config.get('db.host')}/${config.get(
  'db.name',
)}?${config.get('db.logOptions')}`
module.exports = () => {
  winston.add(new winston.transports.Console())
  winston.add(
    new winston.transports.MongoDB({
      db: connectionString,
      options: { useUnifiedTopology: true },
    }),
  )
}
