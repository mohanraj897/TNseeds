const mongoose =
  require('mongoose')

const userSchema =
  new mongoose.Schema({
    name: String,
    email: {
      type: String,
      unique: true
    },
    picture: String,
    provider: {
      type: String,
      default: 'google'
    }
  })

module.exports =
  mongoose.model(
    'User',
    userSchema
  )
  // google authentication user model