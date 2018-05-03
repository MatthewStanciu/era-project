var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
const r = require('rethinkdb');
let parseRethinkDB = require('parse-rethinkdb-url');

app.use('/public', express.static('public'));

let connectionString = process.env.COMPOSE_RETHINKDB_URL;
let options = parseRethinkDB(connectionString);

//connect to Compose deployment of RethinkDB
fs.readFile('./cacert', function(err, caCert) {
  r.connect({
    host: 'aws-us-east-1-portal.14.dblayer.com',
    port: 16314,
    authKey: process.env.AUTH_KEY,
    ssl: {
      ca: caCert
    }
  }, function(error, conn) {
    if (error) throw error;
    io.on('connection', function(socket) {
      console.log("connected");
      socket.on('name', function(data) {
        r.db('eraproject').table('students').filter({"name" : data}).pluck("balance").run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
            if (err) throw err;
            socket.emit('balance', result[0].balance);
          });
        });
      });
      r.db('eraproject').table('students').changes().run(conn, function(err, cursor) {
        cursor.each(console.log);
      });
    });
  });
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.get("/input", function (request, response) {
  response.sendFile(__dirname + '/views/input.html');
});
app.get("/state", function (request, response) {
  response.sendFile(__dirname + '/views/state-change.html');
});
app.get("/data", function (request, response) {
  response.sendFile(__dirname + '/public/studentdbv2.json');
});

http.listen(3000);
