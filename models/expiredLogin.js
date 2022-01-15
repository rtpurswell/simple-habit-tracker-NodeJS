const mongoose = require('mongoose')

const expiredLoginSchema = new mongoose.Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const ExpiredLogin = mongoose.model('expiredLogin', expiredLoginSchema)

exports.ExpiredLogin = ExpiredLogin
