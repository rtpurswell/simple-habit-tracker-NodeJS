const mongoose = require('mongoose')
const Joi = require('joi')
const debug = require('debug')('app:habit')

const colorSchema = new mongoose.Schema({
  r: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  g: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  b: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
})
const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 35,
    required: true,
  },
  color: {
    type: colorSchema,
    required: true,
  },
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
})
function validate(habit) {
  const schema = {
    name: Joi.string().min(2).max(35).required(),
    color: Joi.object({
      r: Joi.number().min(0).max(255).required(),
      g: Joi.number().min(0).max(255).required(),
      b: Joi.number().min(0).max(255).required(),
    }).required(),
  }
  return Joi.object(schema).validate(habit)
}

const Habit = mongoose.model('Habit', habitSchema)

exports.Habit = Habit
exports.validate = validate
