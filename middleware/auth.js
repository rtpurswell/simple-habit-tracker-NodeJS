const jwt = require('jsonwebtoken')
const config = require('config')
const { ExpiredLogin } = require('../models/expiredLogin')

module.exports = async function (req, res, next) {
  const token = req.header('x-auth-token')
  if (!token) return res.status(401).send('Access Denied. No token Provided')
  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
    const login = await ExpiredLogin.findOne({
      _userId: decoded._id,
      createdAt: { $lt: decoded.created },
    })
    if (!login) return res.status(400).send('Token Invalidated')
    req.user = decoded
    next()
  } catch (ex) {
    res.status(401).send('Invalid Token')
  }
}
