var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true},
    //Sedasi saame luua erinevaid küsimuste tüüpe
    //ilma täiesti uute mudelite loomiseta
    variants: [Schema.Types.Mixed],
    maxPoints: { type: Number, required: true},
});

var Question = mongoose.model('Question', QuestionSchema);

module.exports = {
  Question: Question
};
