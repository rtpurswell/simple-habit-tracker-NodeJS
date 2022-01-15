const mongoose = require('mongoose')

const passwordResetTokenSchema = new mongoose.Schema(
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
        return date.setHours(date.getMinutes() + 10)
      },
    },
  },

  {
    timestamps: true,
  },
)

const PasswordResetToken = mongoose.model(
  'PasswordResetToken',
  passwordResetTokenSchema,
)
exports.PasswordResetToken = PasswordResetToken
