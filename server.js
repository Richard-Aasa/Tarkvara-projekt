var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    mongoose = require('mongoose'),
    env = process.env;

mongoose.createConnection(config.db);
var server = express();
server.use(bodyParser.urlencoded({
    extended: false
}));
server.use(bodyParser.json());
server.use(express.static(__dirname + "/public"));

server.get('/health', function(req, res) {
    res.send(200)
});

var Question = require('./models/question').Question;
server.get('/questions', function(req, res) {
    Question.find(function(err, questions) {
        if (err) {
            console.error(err);
            return res.json(err);
        }
        res.json(questions);
    });
});

server.post('/questions', function(req, res) {
    var postData = req.body;

    console.log(postData);

    if (postData.title && postData.type && postData.variants && postData.maxPoints) {

        var newQuestion = new Question({
            title: postData.name,
            type: postData.type,
            variants: postData.variants,
            maxPoints: postData.maxPoints
        });

        newQuestion.save(function(err, question) {

            //handle saving error
            if (err) {
                console.error(err);
                return res.json(err);
            }

            //return saved entry
            res.json(question);
        });

    } else {
        //if missing parameters returs error
        res.sendStatus(400);
    }
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
        res.status(403).json({
            message: "Not authorized"
        });
        return;
    }

    console.error("[" + (err.status || 500) + "] " + (new Date()).toString() + " " + req.url + ' ' + err);
    var message = err.status == 404 ? err.message : "Unknown error";
    res.status(err.status || 500).json({
        status: err.status || 500,
        message: message //should by default hide in production
    });
});

process.on('uncaughtException', function(err) {
    console.error((new Date()).toString() + ' uncaughtException:', err.message);
    console.error(err.stack);
});

server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
    console.log(`Application worker started...`);
});
