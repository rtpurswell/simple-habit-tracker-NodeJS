const express = require('express')
//Initilize all global middleware

const helmet = require('helmet')
const morgan = require('morgan')
var cors = require('cors')
const debug = require('debug')('app:startup')
const config = require('config')

var corsOptions = {
  origin: config.get('corsOrigin'),
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

module.exports = (app) => {
  app.use(helmet())
  app.use(express.json())
  app.use(cors(corsOptions))

  if (config.get('debug.httpLog')) {
    app.use(morgan('tiny'))
    debug('Morgan enabled...')
  }
}
