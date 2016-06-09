var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// ülemine osa jääb kõigis mudelites samaks. Igale lehele on vaja mudelit

var OneQuestionSchema = new Schema({
	totalTime: { type: Number, required: true },
	points: { type: Number, required: true }
});

var StatisticsSchema = new Schema({
    questionnaire: { type: Number, required: true },
    user: { type: Number, required: true},
	//küsimustiku täitmise algusaeg
	fillDate: { type: Date, default: Date.now},
    //iga küsimuse peale kulunud aeg ja iga küsimuse eest saadud punktid, objektidena massiivis
	questions: [OneQuestionSchema],
	userTime: {type: Number, required: true},
    userPoints: {type: Number, required: true}
});
var Statistics = mongoose.model('Statistics', StatisticsSchema);

module.exports = {
  Statistics: Statistics
};
