const mongoose = require('mongoose')
const config = require('config')
const debug = require('debug')('app:startup')
const path = require('path')

let connectionString
let options
if (process.env.NODE_ENV === 'test') {
  options = null
  connectionString = `${config.get('db.protocall')}://${config.get(
    'db.username',
  )}:${config.get('db.testingPassword')}@${config.get('db.host')}/${config.get(
    'db.name',
  )}?${config.get('db.logOptions')}`
} else {
  const cert = path.resolve('/etc/ssl/AtlasCert.pem')

  connectionString = `${config.get('db.protocall')}://${config.get(
    'db.host',
  )}/${config.get('db.name')}?${config.get('db.options')}`
  options = {
    ssl: true,
    sslCert: cert,
    sslKey: cert,
  }
}
module.exports = function () {
  mongoose
    .connect(connectionString, options)
    .then(() =>
      debug(
        `Connected to MongoDb at ${config.get(
          'db.host',
        )} to collection ${config.get('db.name')}`,
      ),
    )
    .catch((error) => {
      console.log(error)
    })
  //mongoose.set('debug', true)
}
