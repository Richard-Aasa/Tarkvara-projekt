var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// ulemine osa jääb kõigis mudelites samaks. Igale lehele on vaja mudelit

var QuestionnaireSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true},
	createdDate: { type: Date, default: Date.now},
    //Sedasi saame luua erinevaid küsimuste tüüpe
    //ilma täiesti uute mudelite loomiseta
    questions: [Question],
	totalTime: {type: Number, required: true},
    totalPoints: {type: Number, required: true},
	saved: Date,
	published: Date,
	archieved: Date,
	// staatused: salvestatud, avaldatud, arhiveeritud
	// total tuleb küsimuste max punktide summast
});
var Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema);

module.exports = {
  Questionnaire: Questionnaire
};