const express = require('express')
const router = express.Router()
const { User, validateLogin } = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

router.post('/', async (req, res) => {
  const { error } = validateLogin(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Invalid email or Password')

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send('Invalid email or Password')

  const authToken = user.generateAuthToken()
  const refreshToken = user.generateRefreshToken()
  res.send({ auth: authToken, refresh: refreshToken })
})
router.post('/refresh', auth, async (req, res) => {
  const token = req.header('x-refresh-token')
  if (!token) return res.status(401).send('Access Denied. No token Provided')
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
    if (!decoded.refresh) return res.status(400).send('Invalid Token')
    if (decoded._id !== user._id) return res.status(400).send('Invalid Token')
    const user = await User.findById(req.user._id)
    if (!user) return res.status(400).send('User no longer exists')
    const authToken = user.generateAuthToken()
    res.send(authToken)
  } catch (ex) {
    res.status(400).send('Invalid Token')
  }
})
module.exports = router
