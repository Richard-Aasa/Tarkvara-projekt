// Node moodulite initsialiseerimine
var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    mongoose = require('mongoose'),
    env = process.env;

// MongoDB address
var url = config.db

// Ühenda MongoDB andmebaasiga mongoose mooduli abil
var connect = function() {
    mongoose.connect(url);
};
connect();
var db = mongoose.connection;

// Ühenduse kontroll
db.on('error', function(error) {
    console.log("Error loading the db - " + error);
});

db.on('disconnected', connect);

// Serveri lõpp-punktide jagamine (REST API) mooduli 'express' deklareerimine
var app = express();

// Mooduli bodyParser initsialiseerimine - tõlgendab vastust JSON kujule
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Serveeri 'public' kaust kliendile
app.use(express.static(__dirname + "/public"));

// Lõpp-punkt töötamise kontrollimiseks
app.get('/health', function(req, res) {
    res.send(200)
});

// Mudelite deklareerimine
var Question = require('./models/question').Question;

// REST API lõpp-punktide deklareerimine
/*
  GET - find()
  POST - save()
  GET/:id - findByID()
  PUT/:id - findByID() = req => save()
  DELETE/:id - findOneAndRemove()
*/
app.get('/questions', function(req, res) {
    Question.find(function(err, questions) {
        if (err) {
            console.error(err);
            return res.json(err);
        }
        res.json(questions);
    });
});
app.post('/questions', function(req, res) {
    var postData = req.body;

    if (postData.title) {

        var newQuestion = new Question({
            title: postData.title,
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
app.get('/questions/:id', function(req, res, next) {
    var params = req.params;

    if (params.id) {

        var query = Question.findOne({
            '_id': 'params.id'
        });

        query.select("title type variants maxPoints");
        query.exec(function(err, questions) {
            if (err) {
                console.error(err);
                return res.json({
                    "error": "did not find any matching questions"
                });
            }
            res.json(questions);
        });

    } else {
        res.sendStatus(400);
    }

});
app.put('/questions/:id', function(req, res) {
    Question.findById(req.params.id, function(err, question) {

        if (err)
            res.send(err);

        if (question.title && req.body.title) {

            question.title = req.body.title,
            question.type = req.body.type,
            question.variants = req.body.variants,
            question.maxPoints = req.body.maxPoints

            question.save(function(err) {
                if (err)
                    res.send(err);

                res.json(question);
            });

        } else {
            //if missing parameters returs error
            res.sendStatus(400);
        }
    });
});
app.delete('/questions/:id', function(req, res, next) {

    var params = req.params;

    if (params.id) {

        var conditions = {
            _id: params.id
        };

        var query = Question.findOneAndRemove(conditions);

        query.exec(function(err, question) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    "error": "Did not find question or no authorization"
                });
            }
            res.json(question);
        });

    } else {
        res.sendStatus(400);
    }
});


//404
app.use(function(req, res, next) {
    var err = new Error('Resource not found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {

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

app.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
    console.log(`Application worker started...`);
});
