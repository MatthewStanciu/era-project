var assert = require('assert');
var parse = require('./index');

describe('parse-rethinkdb-url', function() {
  it('should parse all known options', function() {
    var options = parse('rethinkdb://AzureDiamond:hunter2@localhost:28015/marvel');
    var expected = {
      host: 'localhost',
      port: 28015,
      db: 'marvel',
      authKey: 'hunter2'
    };
    assert.deepEqual(expected, options);
  });

  it('should work without auth', function() {
    var options = parse('rethinkdb://localhost:28015/marvel');
    var expected = {
      host: 'localhost',
      port: 28015,
      db: 'marvel'
    };
    assert.deepEqual(expected, options);
  });

  it('should work without db', function() {
    var options = parse('rethinkdb://AzureDiamond:hunter2@localhost:28015');
    var expected = {
      host: 'localhost',
      port: 28015,
      authKey: 'hunter2'
    };
    assert.deepEqual(expected, options);
  });

  it('should work without port', function() {
    var options = parse('rethinkdb://AzureDiamond:hunter2@localhost/marvel');
    var expected = {
      host: 'localhost',
      db: 'marvel',
      authKey: 'hunter2'
    };
    assert.deepEqual(expected, options);
  });

  it('should work without host', function() {
    var options = parse('rethinkdb://AzureDiamond:hunter2@:28015/marvel');
    var expected = {
      port: 28015,
      db: 'marvel',
      authKey: 'hunter2'
    };
    assert.deepEqual(expected, options);
  });

  it('should throw when protocol is not "rethinkdb"', function() {
    assert.throws(function() {
      parse('mongodb://db1.example.net,db2.example.net:2500/?replicaSet=test');
    });
  });

  it('should throw when auth has no password (only username)', function() {
    assert.throws(function() {
      parse('rethinkdb://AzureDiamond@localhost:28015/marvel');
    });
  });
});
