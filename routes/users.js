const express = require('express')
const router = express.Router()
const _ = require('lodash')
const bcrypt = require('bcrypt')
const passwordComplexity = require('joi-password-complexity')
const auth = require('../middleware/auth')
const { Token } = require('../models/emailToken')
const { User, validate } = require('../models/user')
const { PasswordResetToken } = require('../models/passwordResetToken')

router.post('/', async (req, res) => {
  //Validate user object and ensure it does not already exist
  const { error: joiError } = validate(req.body)
  if (joiError) return res.status(400).send(joiError.details[0].message)
  const { error: passwordError } = passwordComplexity(
    undefined,
    'Password',
  ).validate(req.body.password)
  if (passwordError)
    return res.status(400).send(passwordError.details[0].message)

  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User Already Exists')

  user = new User(_.pick(req.body, ['name', 'email', 'company', 'password']))
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  user = await user.save()

  const emailToken = await user.generateEmailToken()
  user.sendConfirmationEmail(emailToken)

  await user.setExpiredLogin()

  const authToken = user.generateAuthToken()
  const refreshToken = user.generateRefreshToken()
  res.send({ auth: authToken, refresh: refreshToken })
})
router.post('/password', auth, async (req, res) => {
  if (!req.body.password || !req.body.newpassword)
    return res.status(400).send('password and newPassword are required')
  const { error } = passwordComplexity(undefined, 'New Password').validate(
    req.body.newpassword,
  )
  if (error) return res.status(400).send(error.details[0].massage)
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).send('User no longer exists')

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send('Invalid Password')

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(req.body.password, salt)
  await user.save()
  await user.setExpiredLogin()
  res.send('Password Updated. Please login with your new password')
})
router.post('/forgotPassword', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user)
    return res.status(404).send('User with the given email does not exist')
  const token = await user.generatePasswordResetToken()
  const { error } = await user.sendPasswordReset(token)
  if (error) return res.status(500).send('There was problem sending the email')
  res.send(
    'An email has been sent with instructions on resetting your password',
  )
})
router.post('/forgotPassword/validate', async (req, res) => {
  const token = await PasswordResetToken.findOne({
    _userid: req.body._userId,
    key: req.body.key,
  })
  if (!token) return res.status(404).send('Token not found')
  res.send('Token Found')
})
router.put('/forgotPassword', async (req, res) => {
  const { error } = passwordComplexity(undefined, 'Password').validate(
    req.body.password,
  )
  if (error) return res.status(400).send(error.details[0].message)

  const token = await PasswordResetToken.findOne({
    _userId: req.body._userId,
    key: req.body.key,
  })
  if (!token) return res.status(404).send('Token not found')

  const user = await User.findById(req.body._userId)
  if (!user) return res.status(404).send('User no longer exists')

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(req.body.password, salt)
  await user.save()
  await token.remove()
  res.send('Password Updated')
})
router.get('/confirmEmail', async (req, res) => {
  const token = await Token.findOne({
    _userid: req.query.user,
    key: req.query.key,
    expired: { $gt: Date.now() },
  })
  if (!token) return res.status(404).send('Token not found')
  const user = await User.findById(req.query.user)
  if (!user) return res.status(404).send('User not found')
  user.active = true
  await user.save()
  await token.remove()
  res.status(200).send('Email Verified')
})
router.get('/resendEmail', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).send('User does not exist')
  if (user.active) return res.status(400).send('Email already verified')
  let token = await Token.findOne({
    _userid: req.user._id,
    expired: { $gt: Date.now() },
  })
  if (!token) token = await user.generateEmailToken()
  const { error } = user.sendConfirmationEmail(token)
  if (error) return res.status(400).send(error)
  res.status(200).send('Confirmation Email Sent')
})
module.exports = router
