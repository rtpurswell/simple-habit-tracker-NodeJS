const Joi = require('joi')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('config')
const debug = require('debug')('app:users')
const bcrypt = require('bcrypt')
const { ExpiredLogin } = require('./expiredLogin')
const { PasswordResetToken } = require('./passwordResetToken')
const { Token } = require('./emailToken')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 55,
      required: true,
    },
    email: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
      trim: true,
      lowercase: true,
      validate: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      active: this.active,
      name: this.name,
      created: Date.now(),
    },
    config.get('jwtPrivateKey'),
    { expiresIn: '2h' },
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      refresh: true,
    },
    config.get('jwtPrivateKey'),
    { expiresIn: '48h' },
  )
}
userSchema.methods.setExpiredLogin = async function () {
  await ExpiredLogin.deleteMany({ _userId: this._id })
  const login = new ExpiredLogin({
    _userId: this._id,
  })
  await login.save()
  return login
}
userSchema.methods.generatePasswordResetToken = async function () {
  await PasswordResetToken.deleteMany({ _userId: this._id })
  let key = await require('crypto').randomBytes(48)
  key = key.toString('hex')
  const token = new PasswordResetToken({
    _userId: this._id,
    key: key,
  })
  await token.save()
  return token
}
userSchema.methods.sendPasswordReset = async function (token) {
  const link = encodeURI(
    `${config.get('sslEnabled') ? 'http' : 'http'}://${config.get(
      'domain',
    )}/resetPassword/${this._id}/${token.key}`,
  )
  debug(`Sending Confiramtion email to ${this.email} ... Link : ${link}`)
  return { error: false }
}
userSchema.methods.generateEmailToken = async function () {
  await Token.deleteMany({ _userId: this._id })
  let key = await require('crypto').randomBytes(48)
  key = key.toString('hex')
  const token = new Token({ _userId: this._id, key: key })
  await token.save()
  return token
}
userSchema.methods.sendConfirmationEmail = async function (token) {
  const link = encodeURI(
    `${config.get('sslEnabled') ? 'http' : 'http'}://${config.get(
      'domain',
    )}/users/confirmEmail?user=${this._id}&key=${token.key}`,
  )
  debug(`Sending Confiramtion email to ${this.email} ... Link : ${link}`)
  return { error: false }
}

function validate(user) {
  const schema = {
    name: Joi.string().min(2).max(55).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(255).required(),
  }
  return Joi.object(schema).validate(user)
}
function validateLogin(login) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(255).required(),
  })
  return schema.validate(login)
}

const User = mongoose.model('User', userSchema)

module.exports.User = User
module.exports.validate = validate
module.exports.validateLogin = validateLogin
