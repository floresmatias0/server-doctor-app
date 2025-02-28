const { Schema, model } = require('mongoose');

const InstagramSchema = new Schema({
  id: {type:Number},
  currentToken: {type: String},
  ivToken: {type: String},
  expirationDate: {type: Date}
})

module.exports = model('Instagram', InstagramSchema)
