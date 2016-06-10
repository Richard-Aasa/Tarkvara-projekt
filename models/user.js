var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validator = require('validator');

var UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate: [validator.isEmail, 'invalid email']
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  teacher: {
    type: Boolean,
    default: false
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
