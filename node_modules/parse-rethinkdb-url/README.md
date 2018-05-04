parse-rethinkdb-url
===================

Parse RethinkDB URL string into an object ready for consumption by RethinkDB JavaScript API.

[![Build Status](https://travis-ci.org/laggyluke/node-parse-rethinkdb-url.svg?branch=master)](https://travis-ci.org/laggyluke/node-parse-rethinkdb-url)

Installation
------------

```
npm install --save parse-rethinkdb-url
```


Usage
-----

```javascript
var r = require('rethinkdb');
var parseRethinkdbUrl = require('parse-rethinkdb-url');

var options = parseRethinkdbUrl('rethinkdb://AzureDiamond:hunter2@localhost:28015/marvel');
// { host: 'localhost',
//   port: 28015,
//   db: 'marvel',
//   authKey: 'hunter2' }

r.connect(options, function(err, conn) { ... });
```

Please note that when using authentication both username and password must be provided.
Username is ignored while password is used as authKey.
