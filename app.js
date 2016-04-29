var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    contentTypes = require('./utils/content-types'),
    sysInfo = require('./utils/sys-info'),
    express = require('express'),
    env = process.env;

// var server = http.createServer(function(req, res) {
//     let url = req.url;
//     if (url == '/') {
//         url += 'index.html';
//     }
//
//     // IMPORTANT: Your application HAS to respond to GET /health with status 200
//     //            for OpenShift health monitoring
//
//     if (url == '/health') {
//         res.writeHead(200);
//         res.end();
//     } else if (url.indexOf('/info/') == 0) {
//         res.setHeader('Content-Type', 'application/json');
//         res.setHeader('Cache-Control', 'no-cache, no-store');
//         res.end(JSON.stringify(sysInfo[url.slice(6)]()));
//     } else {
//         fs.readFile('./static' + url, function(err, data) {
//             if (err) {
//                 res.writeHead(404);
//                 res.end();
//             } else {
//                 let ext = path.extname(url).slice(1);
//                 res.setHeader('Content-Type', contentTypes[ext]);
//                 if (ext === 'html') {
//                     res.setHeader('Cache-Control', 'no-cache, no-store');
//                 }
//                 res.end(data);
//             }
//         });
//     }
// });
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
server.get('/questiontypes', function(req, res) {
    // Siin oleks reaalsuses ühendus MONGOGA
    var types = ["Valik", "Paigutus", "Sisestus"];
    res.json(types);
});
server.listen(env.NODE_PORT || 3000, env.NODE_IP || 'localhost', function() {
    console.log(`Application worker started...`);
});
