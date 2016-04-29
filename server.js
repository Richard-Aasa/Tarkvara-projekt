// See fail on Node.js alguspunkt
// Selles failis peavad olema mainitud kõik 'moodulid'
// mis lähevad kasutusse

// Tegeleb serveri loogikaga,
// täpsemalt GET, POST requestidega.
// Kliendipoolne routimine on /public/client.js failis
var express = require('express');

// app on objekt mis hõlmab tervet rakendust
var app = express();

// Kust otsida staatilisi (CSS/HTML/pildid) faile
// Siia tekivad erinevad 'vaated' nagu opetaja/opilane/login/register
app.use(express.static(__dirname + "/public"));

app.get('/questions', function(req, res) {
    // Siin oleks reaalsuses ühendus MONGOGA
    var questions = [{
        title: "Millal sündis X",
        type: 'Valik',
        variants: [{
            answer: "1337",
            points: 0,
            bool: false
        }, {
            answer: "1990",
            points: 0,
            bool: false
        }, {
            answer: "2016",
            points: 15,
            bool: true
        }],
        maxPoints: 15
    }, {
        title: "Millal sündis Y",
        type: 'Sisestus',
        variants: [{
            answer: "Aastal 1928",
            points: 5
        }, {
            answer: "Aastal 1928, kuskil Siberis",
            points: 10
        }, {
            answer: "Aastal",
            points: 15
        }, {
            answer: "Kuskil Siberis",
            points: 1
        }],
        maxPoints: 15
    }];
    res.json(questions);
});
app.get('/questiontypes', function(req, res) {
    // Siin oleks reaalsuses ühendus MONGOGA
    var types = ["Valik", "Paigutus", "Sisestus"];
    res.json(types);
});
// Mis pordi peal kuulata muudatusi
app.listen(3000);
console.log("Hosting on port 3000");

//test test test @Richard
