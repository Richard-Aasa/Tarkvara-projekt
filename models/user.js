var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validator = require('validator');

var UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    required: true
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
  teacher: Boolean
});

var User = mongoose.model('User', UserSchema);

module.exports = {
  User: User
};
