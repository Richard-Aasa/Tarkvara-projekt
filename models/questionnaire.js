var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// ulemine osa jääb kõigis mudelites samaks. Igale lehele on vaja mudelit

var QuestionnaireSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    createdDate: Date,
    //Sedasi saame luua erinevaid küsimuste tüüpe
    //ilma täiesti uute mudelite loomiseta
    questions: [{
        title: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        variants: [Schema.Types.Mixed],
        maxPoints: {
            type: Number,
            required: true
        }
    }],
    totalTime: {
        type: Number,
        required: true
    },
    totalPoints: {
        type: Number,
        required: true
    },
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
