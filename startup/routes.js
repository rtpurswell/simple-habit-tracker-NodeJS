const habits = require('../routes/habits')
const records = require('../routes/records')
const error = require('../middleware/error')
module.exports = (app) => {
  app.use('/habits', habits)
  app.use('/records', records)
  app.use(error)
}
