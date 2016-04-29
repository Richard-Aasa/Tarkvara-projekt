var express = require('express'),
    env = process.env;

var server = express();
server.use(express.static(__dirname + "/public"));

server.get('/health', function(req, res) {
  res.send(200)
});

server.get('/questions', function(req, res) {
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
server.get('/types', function(req, res) {
    // Siin oleks reaalsuses ühendus MONGOGA
    var types = ["Valik", "Paigutus", "Sisestus"];
    res.json(types);
});
server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
    console.log(`Application worker started...`);
});
