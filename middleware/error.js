const winston = require('winston')

module.exports = function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send('Invalid Token')
  }
  winston.error(err.message, err)
  res.status(500).send('Internal Server Error')
}
