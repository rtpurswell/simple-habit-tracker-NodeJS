require('express-async-errors')
const express = require('express')
const app = express()
const config = require('config')

if (!config.get('jwtPrivateKey')) {
  console.log('FATAL ERROR: quiz_jwtPrivateKey environment variable is not set')
  process.exit(1)
}

//Connect to DB
require('./startup/db')()

require('./startup/logger')()

require('./startup/handleErrors')()
//Initilize modules that need to be added at startup
require('./startup/init')()

//Add Global Middleware
require('./startup/middleware')(app)

//Set API Routes
require('./startup/routes')(app)

const port = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
  })
}
module.exports = app
