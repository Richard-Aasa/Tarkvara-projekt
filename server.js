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
    question: "Millal sündis X",
    answer: "X sündis aastal . . .",
    timeStart: new Date(),
    timeElapsed: new Date() - this.timeStart
  },
  {
    question: "Millal sündis Y",
    answer: "Y sündis aastal . . .",
    timeStart: new Date(),
    timeElapsed: new Date() - this.timeStart
  },
  {
    question: "Millal sündis Z",
    answer: "Z sündis aastal . . .",
    timeStart: new Date(),
    timeElapsed: new Date() - this.timeStart
  },
  {
    question: "Millal sündis W",
    answer: "W sündis aastal . . .",
    timeStart: new Date(),
    timeElapsed: new Date() - this.timeStart
  }];
  res.json(questions);
});

// Mis pordi peal kuulata muudatusi
app.listen(3000);
console.log("Hosting on port 3000");
