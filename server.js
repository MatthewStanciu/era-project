var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var stateFile = './state.json';
var state = require(stateFile);
var timerFile = './timer.json';
var timer = require(timerFile);
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
          else if (currentState["currentstate"] == "watch-deepthroat") pay5(data);
          //else if(currentState["currentstate"] == "update-income") livingCosts(data);
          else if(currentState["currentstate"] == "kill") kill(data);
          else if(currentState["currentstate"] == "jail")  {
            jail(data);
            setTimeout(pushBalance, 3000, data);
          }
          else if(currentState["currentstate"] == "protest-vietnam") protestVietnam(data);
          else if(currentState["currentstate"] == "draft") draft(data);
          else if(currentState["currentstate"] == "find-horsehead") findHorsehead(data);
          else if(currentState["currentstate"] == "answer-question") answerQuestion(data);
          else if(currentState["currentstate"] == "update-balances") livingCosts(data);
        });
      });

      function pushBalance(studentid) {
        r.db('eraproject').table('students').get(studentid).pluck("balance").run(conn, function(err, result) {
          if (err) throw err;
          if (result.balance >= 100000000) {
            r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-100000000)}).run(conn, function(err, result) {
              if (err) throw err;
            });

            socket.emit('balance', result.balance - 100000000);
          }
          else socket.emit('balance', result.balance);
        });
      }

      function jail(studentid) {
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(100000000)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("jailed " + studentid);
        });
        r.db('eraproject').table('students').get(studentid).pluck("balance").run(conn, function(err, result) {
          if (err) throw err;
          console.log(result);
          socket.emit('balance', result.balance);
        });
        // in order to accurately jail, call jail(studentid), then call setTimeout(pushBalance, 300000, studentid);
      }

      function kill(studentid) {
        r.db('eraproject').table('students').get(studentid).pluck("balance").run(conn, function(err, result) {
          if (err) throw err;
          var balance = result.balance;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-balance)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log("killed " + studentid);
            pushBalance(studentid);
          });
        });
      }

      var dice = {
        sides: 6,
        roll: function() {
          var randomNumber = Math.floor(Math.random() * this.sides) + 1;
          return randomNumber;
          // use example: var result = dice.roll();
        }
      }

      function protestVietnam(studentid) {
        var d = dice.roll();
        if (d == 4 || d == 5) {
          jail(studentid);
          setTimeout(pushBalance, 300000, studentid);
        }
        else if (d == 6) {
          kill(studentid);
        }
        else console.log(studentid + " lived!")
      }

      function shuffleArray(array) {
          var currentIndex = array.length, temporaryValue, randomIndex;
          while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
          }
      }

      function draft(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (result.name == "Shaheer" || result.name == "Bryson") kill(studentid);
        });
      }

      function getIncome(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          return result.income;
        });
      }

      function findHorsehead(studentid) {
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(1000)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("gave $1000 to " + studentid);
        });
      }

      function answerQuestion(studentid) {
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(500)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("gave $1000 to " + studentid);
        });
      }

      function getPay(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          return result.pay;
        });
      }

      function pay5(studentid) {
        var bal = 0;
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-5)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("removed 5 from " + studentid);
          pushBalance(studentid);
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

      function livingCosts(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          var newIncome = result.income - result.pay;
          console.log(newIncome);
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(newIncome)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log("added income to " + studentid);
            pushBalance(studentid);
          });
        });
      }

      /*function updateLivingCosts() { //doesn't work -- i have no idea what it's doing but it's like running it a bunch of times when it's called
        r.db('eraproject').table('students').run(conn, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
            if (err) throw err;
            var i;
            for (i = 0; i < 24; i++) {
              var bal = result[i].balance;
              console.log(result[i].name + " " + bal);
              var newBal = bal+(result[i].income-result[i].pay);
              console.log(result[i].name + " " + newBal);
              console.log(result[i].name + " " + result[i].id);
              console.log(i);

              r.db('eraproject').table('students').get(result[i].id).update({balance:r.row("balance").add(newBal)}).run(conn, function(err, result) {
                console.log("added $" + newBal + " to " + result[i].id);
                pushBalance(result[i].id);
              });
            }
          });
        });
      }*/
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
