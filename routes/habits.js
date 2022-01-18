const express = require('express')
const router = express.Router()
const _ = require('lodash')
const auth = require('../middleware/auth')
const { Habit, validate } = require('../models/habit')
const validateObjectId = require('../middleware/validateObjectId')
const { Record } = require('../models/record')

router.get('/', auth, async (req, res) => {
  const habits = await Habit.find({ _userId: req.user.sub })
  res.send(habits)
})
router.get('/:id', auth, validateObjectId, async (req, res) => {
  const habit = await Habit.findOne({
    _userId: req.user.sub,
    _id: req.params.id,
  })
  if (!habit) return res.status(404).send('Habbit not found')

  res.send(habit)
})
router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let habit = new Habit({
    _userId: req.user.sub,
    name: req.body.name,
    color: req.body.color,
  })
  habit = await habit.save()
  res.send(habit)
})
router.put('/:id', auth, validateObjectId, async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const habit = await Habit.findOne({
    _userId: req.user.sub,
    _id: req.params.id,
  })
  if (!habit) return res.status(404).send('Habit not found')

  habit.name = req.body.name
  habit.color = req.body.color
  await habit.save()
  res.send(habit)
})
router.delete('/:id', auth, validateObjectId, async (req, res) => {
  const habit = await Habit.findOne({
    _userId: req.user.sub,
    _id: req.params.id,
  })
  if (!habit) return res.status(404).send('Habit not found')
  await habit.remove()
  await Record.deleteMany({ _userId: req.user.sub, _habitId: req.params.id })
  res.send(habit)
})
module.exports = router
