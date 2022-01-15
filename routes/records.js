const express = require('express')
const router = express.Router()
const _ = require('lodash')

const auth = require('../middleware/auth')
const validateObjectId = require('../middleware/validateObjectId')

const { Record, validate } = require('../models/record')
const { Habit } = require('../models/habit')

router.get('/', auth, async (req, res) => {
  // May implement start and end date in the future for optimization
  // const startDate =
  //   req.query.startDate ||
  //   new Date(new Date().setDate(new Date().getDate() - 30)).getTime()
  // const endDate = req.query.endDate || Date.now()

  // const records = await Record.find({
  //   _userId: req.user._id,
  //   completedAt: { $gt: startDate, $lte: endDate },
  // })
  const records = await Record.find({
    _userId: req.user._id,
  })
  res.send(records)
})

router.get('/:id', auth, validateObjectId, async (req, res) => {
  if (req.params.all) {
    const records = await Record.find({
      _userId: req.user._id,
      _habitId: req.params.id,
    })
  } else {
    const startDate =
      req.query.startDate ||
      new Date(new Date().setDate(new Date().getDate() - 30)).getTime()
    const endDate = req.query.endDate || Date.now()
    const records = await Record.find({
      _userId: req.user._id,
      _habitId: req.params.id,
      completedAt: { $gt: startDate, $lte: endDate },
    })
  }

  res.send(records)
})

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const habit = await Habit.findOne({
    _id: req.body._habitId,
    _userId: req.user._id,
  })
  if (!habit) return res.status(404).send('Habit not found')

  let record = new Record({
    _userId: req.user._id,
    ..._.pick(req.body, ['_habitId', 'completedAt']),
  })
  record = await record.save()
  res.send(record)
})

router.delete('/:id', auth, validateObjectId, async (req, res) => {
  const record = await Record.findOne({
    _userId: req.user._id,
    _id: req.params.id,
  })
  if (!record) return res.status(404).send('Record not found')
  await record.remove()

  res.send(record)
})
module.exports = router
