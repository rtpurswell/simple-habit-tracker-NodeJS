const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    key: { type: String, required: true },
    expired: {
      type: Date,
      default: function () {
        const date = new Date()
        return date.setHours(date.getHours() + 4)
      },
    },
  },

  {
    timestamps: true,
  },
)

const Token = mongoose.model('EmailToken', tokenSchema)
exports.Token = Token
