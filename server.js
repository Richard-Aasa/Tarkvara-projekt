var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    mongoose = require('mongoose'),
    env = process.env;

var url = config.db
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    url = process.env.OPENSHIFT_MONGODB_DB_URL +
    process.env.OPENSHIFT_APP_NAME;
}
// Connect to mongodb
var connect = function () {
    mongoose.connect(url);
};
connect();
var db = mongoose.connection;

db.on('error', function(error){
    console.log("Error loading the db - "+ error);
});

db.on('disconnected', connect);
var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.get('/health', function(req, res) {
    res.send(200)
});

var Question = require('./models/question').Question;

app.get('/questions', function(req, res) {
    Question.find(function(err, questions) {
        if (err) {
            console.error(err);
            return res.json(err);
        }
        res.json(questions);
    });
});
app.get('questions/:id', function(req, res, next) {

    var params = req.params;

    console.log(params);

    if (params.id) {

        var conditions = {
            _id: params.id
        };
        var update = {
            $inc: {
                viewCount: 1
            }
        };
        var options = {
            new: true
        };

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
app.post('/questions', function(req, res) {
    var postData = req.body;

    console.log(postData);

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
