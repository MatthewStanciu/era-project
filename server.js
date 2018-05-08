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
            console.log(data + " connected");
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
          //could probably benefit from a switch case here but whatever
          if (currentState["currentstate"] == "watch-deepthroat") pay5(data);
          else if(currentState["currentstate"] == "kill") kill(data);
          else if(currentState["currentstate"] == "jail")  {
            jail(data);
            setTimeout(pushBalance, 300000, data);
          }
          else if(currentState["currentstate"] == "protest-vietnam") protestVietnam(data);
          else if(currentState["currentstate"] == "draft") draft(data);
          else if(currentState["currentstate"] == "find-horsehead") findHorsehead(data);
          else if(currentState["currentstate"] == "answer-question") answerQuestion(data);
          else if(currentState["currentstate"] == "update-balances") livingCosts(data);
          else if(currentState["currentstate"] == "update-income") livingCosts(data);
          else if(currentState["currentstate"] == "invest-borders") investBorders(data);
          else if(currentState["currentstate"] == "return-borders") returnBorders(data);
          else if(currentState["currentstate"] == "invest-starbucks") investStarbucks(data);
          else if(currentState["currentstate"] == "return-starbucks") returnStarbucks(data);
          else if(currentState["currentstate"] == "invest-freelandia") investFreelandia(data);
          else if(currentState["currentstate"] == "return-freelandia") returnFreelandia(data);
          else if(currentState["currentstate"] == "invest-oracle") investOracle(data);
          else if(currentState["currentstate"] == "return-oracle") returnOracle(data);
          else if(currentState["currentstate"] == "invest-fedex") investFedex(data);
          else if(currentState["currentstate"] == "return-fedex") returnFedex(data);
          else if(currentState["currentstate"] == "great-inflation") unemploy(data);
          else if(currentState["currentstate"] == "end-great-inflation") employ(data);
          else if(currentState["currentstate"] == "fine") fine(data);
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

      function draft(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (result.name == "Shaheer" || result.name == "Bryson") kill(studentid);
        });
      }

      function investBorders(studentid) {
        r.db('eraproject').table('students').get(studentid).update({sharesborders:r.row("sharesborders").add(10)}).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-120)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " bought 10 borders shares");
          });
        });
      }
      function returnBorders(studentid) {
        console.log(studentid + " made a bad investment decision: Borders!");
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({sharesborders:r.row("sharesborders").add(-result.sharesborders)}).run(conn, function(err, result) {
            if (err) throw err;
          });
        });
      }

      function investFedex(studentid) {
        r.db('eraproject').table('students').get(studentid).update({sharesfedex:r.row("sharesfedex").add(10)}).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-240)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " bought 10 fedex shares");
          });
        });
      }
      function returnFedex(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          var shares = result.sharesfedex;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(240 * result.sharesfedex)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " got $" + (240*shares) + " in fedex returns!");
            r.db('eraproject').table('students').get(studentid).update({sharesfedex:r.row("sharesfedex").add(-shares)}).run(conn, function(err, result) {
              if (err) throw err;
            });
          });
        });
      }

      function investFreelandia(studentid) {
        r.db('eraproject').table('students').get(studentid).update({sharesfreelandia:r.row("sharesfreelandia").add(10)}).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-210)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " bought 10 freelandia shares");
          });
        });
      }
      function returnFreelandia(studentid) {
        console.log(studentid + " made a bad investment decision: Freelandia!");
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({sharesfreelandia:r.row("sharesfreelandia").add(-result.sharesfreelandia)}).run(conn, function(err, result) {
            if (err) throw err;
          });
        });
      }

      function investStarbucks(studentid) {
        r.db('eraproject').table('students').get(studentid).update({sharesstarbucks:r.row("sharesstarbucks").add(10)}).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-170)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " bought 10 starbucks shares");
          });
        });
      }
      function returnStarbucks(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          var shares = result.sharesstarbucks;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(170 * result.sharesstarbucks)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " got $" + (170*shares) + " in starbucks returns!");
            r.db('eraproject').table('students').get(studentid).update({sharesstarbucks:r.row("sharesstarbucks").add(-shares)}).run(conn, function(err, result) {
              if (err) throw err;
            });
          });
        });
      }

      function investOracle(studentid) {
        r.db('eraproject').table('students').get(studentid).update({sharesoracle:r.row("sharesoracle").add(10)}).run(conn, function(err, result) {
          if (err) throw err;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-150)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " bought 10 oracle shares");
          });
        });
      }
      function returnOracle(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          var shares = result.sharesoracle;
          r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(150 * result.sharesoracle)}).run(conn, function(err, result) {
            if (err) throw err;
            console.log(studentid + " got $" + (150*shares) + " in oracle returns!");
            r.db('eraproject').table('students').get(studentid).update({sharesoracle:r.row("sharesoracle").add(-shares)}).run(conn, function(err, result) {
              if (err) throw err;
            });
          });
        });
      }

      function findHorsehead(studentid) {
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(5000)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("gave 5000 to " + studentid);
          pushBalance(studentid);
        });
      }

      function answerQuestion(studentid) {
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(1000)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("gave $1000 to " + studentid);
          pushBalance(studentid);
        });
      }

      //fine those who kill Vietnamese civilians during the final activity
      function fine(studentid) {
        r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-500)}).run(conn, function(err, result) {
          if (err) throw err;
          console.log("fined " + studentid + " for killing a civilian!");
          pushBalance(studentid);
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

      function employ(studentid) {
        r.db('eraproject').table('students').get(studentid).update({unemployed:"false"}).run(conn, function(err, result) {
          console.log("Removed unemployment status from " + studentid);
        });
      }
      function unemploy(studentid) {
        r.db('eraproject').table('students').get(studentid).update({unemployed:"true"}).run(conn, function(err, result) {
          console.log("Added unemployment status to " + studentid);
        });
      }

      function livingCosts(studentid) {
        r.db('eraproject').table('students').get(studentid).run(conn, function(err, result) {
          if (err) throw err;
          var newIncome = result.income - result.pay;
          console.log(newIncome);
          if (result.unemployed == "true") {
            r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(-newIncome)}).run(conn, function(err, result) {
              if (err) throw err;
              console.log(studentid + " is unemployed, so removed income");
              pushBalance(studentid);
            });
          }else {
            r.db('eraproject').table('students').get(studentid).update({balance:r.row("balance").add(newIncome)}).run(conn, function(err, result) {
              if (err) throw err;
              console.log("added income to " + studentid);
              pushBalance(studentid);
            });
          }
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
