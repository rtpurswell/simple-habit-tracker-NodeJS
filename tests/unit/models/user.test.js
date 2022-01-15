const { User } = require('../../../models/user')
const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
describe('user.generateAuthToken', () => {
  it('should return a valid jwt', () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      name: 'Bob',
      email: 'bob@test.com',
    }
    const user = new User({ ...payload, password: 'password123' })
    const token = user.generateAuthToken()
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
    expect(decoded).toMatchObject({ ...payload, active: false })
  })
})
