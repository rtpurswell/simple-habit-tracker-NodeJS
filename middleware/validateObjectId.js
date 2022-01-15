const Joi = require('joi')
module.exports = function (req, res, next) {
  const { error } = Joi.object({ id: Joi.objectId() }).validate({
    id: req.params.id,
  })
  if (error) return res.status(400).send(error.details[0].message)
  next()
}
