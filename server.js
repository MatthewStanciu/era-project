var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var stateFile = './state.json';
var state = require(stateFile);
var fs = require('fs');
const r = require('rethinkdb');

app.use('/public', express.static('public'));

//connect to Compose deployment of RethinkDB
fs.readFile('./cacert', function(err, caCert) {
  r.connect({
    host: process.env.COMPOSE_HOST,
    port: process.env.COMPOSE_HOST_PORT,
    authKey: process.env.AUTH_KEY,
    ssl: {
      ca: caCert
    }
  }, function(error, conn) {
    if (error) throw error;
    io.on('connection', function(socket) {
      console.log("a user connected");
      socket.on('name', function(data) {
        r.db('eraproject').table('students').filter({"name" : data}).pluck("balance").run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
            if (err) throw err;
            console.log(data);
            socket.emit('balance', result[0].balance);
          });
        });
      });
      socket.on('listenName', function(data) {
        r.db('eraproject').table('students').filter(r.row('name').eq(data)).pluck("balance").changes().run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.each(function(err, row) {
            if (err) throw err;
            var newbal = JSON.stringify(row.new_val, null, 2);
            var newbal_parse = JSON.parse(newbal);
            console.log("a change was made: " + data + ":" + newbal_parse.balance);
            socket.emit('balance', newbal_parse.balance);
          });
        });
      });
      socket.on('state', function(newstate) {
        state.currentstate = newstate;
        fs.writeFile(stateFile, JSON.stringify(state), function (err) {
          if (err) return console.log(err);
          console.log(JSON.stringify(state));
          console.log('writing to ' + stateFile);
        });
      });
      socket.on('user', function(data) {
        fs.readFile(stateFile, 'utf8', function(err, state) {
          if (err) throw err;
          var currentState = JSON.parse(state);
          console.log(currentState);
          if (currentState["currentstate"] == "pay-50000") pay50000(data);
          else if (currentState["currentstate"] == "pay-100000") pay100000(data);
        });
      });

      function pushBalance(studentid) {
        r.db('eraproject').table('students').get(studentid).pluck("balance").run(conn, function(err, result) {
          if (err) throw err;
          console.log(result);
          socket.emit('balance', result.balance);
        });
      }

      function pay50000(studentid) {
        var bal = 0;
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-50000)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("removed 50000 from " + studentid);
          pushBalance(studentid);
        });
      }

      function pay100000(studentid) {
        var bal = 0;
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-100000)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("removed 100000 from " + studentid);
          pushBalance(studentid);
        });
      }
    });
  });
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.get("/input", function (request, response) {
  response.sendFile(__dirname + '/views/input.html');
});
app.get("/statechange", function (request, response) {
  response.sendFile(__dirname + '/views/state-change.html');
});
app.get("/data", function (request, response) {
  response.sendFile(__dirname + '/public/studentdbv2.json');
});

http.listen(3000);
