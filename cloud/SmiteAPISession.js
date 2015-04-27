'use strict';
var MOMENT = require('moment');
var CRYPTO = require('crypto');

var TIME_FORMAT = 'YYYYMMDDHHmmss';
var MIN_SESSION_TIME = 14; //Session times out at 15 minutes, using 14 as a safety

function SmiteAPISession(id, key) {
  var session = '';
  var timestamp;

  function loadFromDB() {
    var promise = new Parse.Promise();
    var query = new Parse.Query('Session');
    query.first({
      success: function(row) {
        var storedSessionId = row.get('SessionID');
        var updatedAt = row.get('timestamp');
        var currentTime = MOMENT.utc();
        var rawTimestamp = MOMENT.utc(updatedAt, TIME_FORMAT);
        rawTimestamp.add('m', MIN_SESSION_TIME);
        if (currentTime >= rawTimestamp) {
          promise.resolve(false);
        } else {
          rawTimestamp.subtract('m', MIN_SESSION_TIME);
          timestamp = rawTimestamp.utc().format(TIME_FORMAT);
          session = storedSessionId;
          promise.resolve(true);
        }
      },
      error: function(error) {
        promise.reject('error in loadFromDB. ' + error.message);
      }
    });
    return promise;
  }

  function createNewSession(id, key) {
    var promise = new Parse.Promise();
    var time = MOMENT.utc();
    var serverResponse;
    var md5 = CRYPTO.createHash('md5');
    md5.update(id + 'createsession' + key + time.utc().format(TIME_FORMAT));
    var signature = md5.digest('hex');
    Parse.Cloud.httpRequest({
      url: 'http://api.smitegame.com/smiteapi.svc/createsessionJSON/' + id + '/' + signature + '/' + time.utc().format(TIME_FORMAT),
      headers: {
        'Content-Type': 'application/json'
      },
      success: function(httpResponse) {
        serverResponse = JSON.parse(httpResponse.text);
        if (serverResponse.ret_msg === 'Approved') {
          session = serverResponse.session_id;
          timestamp = time.utc().format(TIME_FORMAT);
          console.log('Session: ' + session + ', created at: ' + timestamp);
          promise.resolve();
        } else {
          promise.reject('Session creation not approved!');
        }
      },
      error: function(httpResponse) {
        promise.reject('error in createNewSession. ' + httpResponse.status);
      }
    });
    return promise;
  }

  function saveToDB() {
    var promise = new Parse.Promise();
    var query = new Parse.Query('Session');
    query.first({
      success: function(row) {
        row.set('SessionID', session);
        row.set('timestamp', timestamp);
        row.save().then(function() {
          promise.resolve();
        });
      },
      error: function(error) {
        promise.reject('error in saveToDB ' + error.message);
      }
    });
    return promise;
  }

  function loadOrCreate(id, key) {
    return loadFromDB().then(function(loadPass) {
      if (!loadPass) {
        return createNewSession(id, key).then(saveToDB);
      }
    });
  }

  this.getSession = function() {
    var promise = new Parse.Promise();
    loadOrCreate(id, key).then(function() {
      promise.resolve(session);
    },
    function(error) {
      promise.reject(error);
    });
    return promise;
  };
}

module.exports = SmiteAPISession;
