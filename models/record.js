const mongoose = require('mongoose')
const Joi = require('joi')

const recordSchema = new mongoose.Schema({
  _userId: {
    type: String,
    required: true,
  },
  _habitId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Habit',
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
})

function validate(record) {
  const schema = {
    _habitId: Joi.objectId().required(),
    completedAt: Joi.date(),
  }
  return Joi.object(schema).validate(record)
}

const Record = mongoose.model('Record', recordSchema)
exports.Record = Record
exports.validate = validate
