// Node moodulite initsialiseerimine
var express = require('express'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  session = require('express-session'),
  MongoDBStore = require('connect-mongodb-session')(session),
  config = require('./config'),
  mongoose = require('mongoose'),
  env = process.env;

// MongoDB address
var url = config.db;

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

// Mudelite deklareerimine
var Question = require('./models/question').Question;
var Questionnaire = require('./models/questionnaire').Questionnaire;
var User = require('./models/user').User;

// Kasutaja logimise moodul
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({
      username: username
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          'errors': {
            'username': {
              type: 'Email is not registered.'
            }
          }
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          'errors': {
            'password': {
              type: 'Password is incorrect.'
            }
          }
        });
      }
      return done(null, user);
    });
  }
));
// Sessiooni haldus
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findOne({
    _id: id
  }, function(err, user) {
    done(err, user);
  });
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}
// Serveri lõpp-punktide jagamine (REST API) mooduli 'express' deklareerimine
var app = express();
var store = new MongoDBStore({
  uri: url,
  collection: 'sessions'
});
// Catch errors
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
  extended: false
}));
app.use(require('body-parser').json());
app.use(require('express-session')({
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(passport.initialize());
app.use(passport.session());

// Serveeri 'public' kaust kliendile
app.use(express.static(__dirname + "/public"));

// Lõpp-punkt töötamise kontrollimiseks
app.get('/health', function(req, res) {
  res.send(200);
});

// REST API lõpp-punktide deklareerimine
/*
  GET - find()
  POST - save()
  GET/:id - findByID()
  PUT/:id - findByID() = req => save()
  DELETE/:id - findOneAndRemove()
*/
app.post('/auth/login', passport.authenticate('local'), function(req, res) {
  res.json(req.user);
});


app.get('/auth/currentuser', isAuthenticated, function(req, res) {
  res.json(req.user);
});

app.post('/auth/signup', function(req, res) {

  var u = new User();
  u.username = req.body.username;
  u.password = req.body.password;
  u.name = req.body.name;
  u.phone = parseInt(req.body.phone);
  u.teacher = false;
  u.save(function(err, user) {
    if (err) {
      console.log(err);
      res.json({
        'alert': 'Registreerimisel tekkis viga'
      });
    } else {
      console.log(user);
      res.json({
        'alert': 'Registreerumine õnnestus!'
      });
    }
  });
});

app.get('/auth/logout', function(req, res) {
  req.logout();
  res.send(200);
});


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

      question.title = req.body.title;
      question.type = req.body.type;
      question.variants = req.body.variants;
      question.maxPoints = req.body.maxPoints;

      question.save(function(err, question) {
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
//küsimustiku aadresside deklareerimine

app.get('/questionnaire', function(req, res) {
  Questionnaire.find(function(err, questionnaires) {
    if (err) {
      console.error(err);
      return res.json(err);
    }
    res.json(questionnaires);
  });
});
//küsimustiku loomine
app.post('/questionnaire', function(req, res) {
  var postData = req.body;

  if (postData.title) {
    var newQuestionnaire = new Questionnaire({
      title: postData.title,
      author: postData.author,
      ///date tuleb automaatselt, seda pole siia vaja
      questions: postData.questions,
      totalTime: postData.totalTime,
      totalPoints: postData.totalPoints,
      saved: postData.saved,
      published: postData.published,
      archieved: postData.archieved

    });

    newQuestionnaire.save(function(err, questionnaire) {

      //handle saving error
      if (err) {
        console.error(err);
        return res.json(err);
      }

      //return saved entry
      res.json(questionnaire);
    });

  } else {
    //if missing parameters returns error
    res.sendStatus(400);
  }
});
app.get('/questionnaire/:id', function(req, res, next) {
  var params = req.params;

  if (params.id) {

    var query = Questionnaire.findOne({
      '_id': 'params.id'
    });

    query.select("title author createdDate questions totalTime totalPoints saved published archieved");
    query.exec(function(err, questionnaire) {
      if (err) {
        console.error(err);
        return res.json({
          "error": "did not find matching questionnaire"
        });
      }
      res.json(questionnaire);
    });

  } else {
    res.sendStatus(400);
  }

});
//parameetrite saatmine
app.put('/questionnaire/:id', function(req, res) {
  Questionnaire.findById(req.params.id, function(err, questionnaire) {

    if (err)
      res.send(err);
    //lihtsustamiseks loome muutuja
    var postData = req.body; //request (päring, mis tuleb vaatest)

    if (questionnaire.title && postData.title) {
      questionnaire.title = postData.title;
      questionnaire.author = postData.author;
      ///date tuleb automaatselt, seda pole siia vaja
      questionnaire.questions = postData.questions;
      questionnaire.totalTime = postData.totalTime;
      questionnaire.totalPoints = postData.totalPoints;
      questionnaire.saved = postData.saved;
      questionnaire.published = postData.published;
      questionnaire.archieved = postData.archieved;

      questionnaire.save(function(err, questionnaire) {
        if (err)
          res.send(err);

        res.json(questionnaire);
      });

    } else {
      //if missing parameters returs error
      res.sendStatus(400);
    }
  });
});
app.delete('/questionnaire/:id', function(req, res, next) {

  var params = req.params;

  if (params.id) {

    var conditions = {
      _id: params.id
    };

    var query = Questionnaire.findOneAndRemove(conditions);

    query.exec(function(err, questionnaire) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          "error": "Did not find questionnaire or no authorization"
        });
      }
      res.json(questionnaire);
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
