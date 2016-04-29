var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ValikSchema = new Schema({
    name: { type: String, required: true },
    created: { type: Date, default: Date.now },
    viewCount: {type: Number, default: 0},
    deleted: { type: Date },
});

var Valik = mongoose.model('Valik', ValikSchema);

module.exports = {
  Valik: Valik
};
