var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    env = process.env;

var server = express();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
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

//404
server.use(function(req, res, next) {
    var err = new Error('Resource not found');
    err.status = 404;
    next(err);
});
server.use(function(err, req, res, next) {

    // ADD if auth error, wrong or expired token
    if (err.name === 'UnauthorizedError') {
        res.status(403).json({message: "Not authorized"});
        return;
    }

    console.error("["+(err.status || 500)+"] "+(new Date()).toString()+" "+req.url +' '+ err);
    var message = err.status == 404 ? err.message : "Unknown error";
    res.status(err.status || 500).json({
        status: err.status || 500,
        message: message //should by default hide in production
    });
});

process.on('uncaughtException', function (err) {
    console.error((new Date()).toString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
    console.log(`Application worker started...`);
});

module.exports = server;
