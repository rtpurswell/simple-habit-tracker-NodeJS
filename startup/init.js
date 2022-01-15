//This file is for packages that need to be initilized before being used in other modules.
const Joi = require('joi')

module.exports = function () {
  Joi.objectId = require('joi-objectid')(Joi)
  Joi.validatePartial = require('joi-validate-partial')(Joi)
}
