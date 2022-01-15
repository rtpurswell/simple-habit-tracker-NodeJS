const users = require('../routes/users')
const auth = require('../routes/auth')
const habits = require('../routes/habits')
const records = require('../routes/records')
const error = require('../middleware/error')
module.exports = (app) => {
  app.use('/users', users)
  app.use('/auth', auth)
  app.use('/habits', habits)
  app.use('/records', records)
  app.use(error)
}
