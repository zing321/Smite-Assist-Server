//Static 'class'
'use strict';
var SMITE_API_SESSION = require('cloud/SmiteAPISession.js');
var MOMENT = require('moment');
var CRYPTO = require('crypto');

function fetchCredentials() {
  var promise = new Parse.Promise();
  Parse.Config.get().then(function(config) {
    promise.resolve({
      'devId': config.get('SMITE_DEV_ID'),
      'devKey': config.get('SMITE_DEV_KEY')
    });
  },
  function() {
    var config = Parse.Config.current();
    var devId = config.get('SMITE_DEV_ID');
    var devKey = config.get('SMITE_DEV_KEY');
    if (devId !== undefined && devKey !== undefined) {
      promise.resolve({
        'devId': devId,
        'devKey': devKey
      });
    } else {
      promise.reject('Unable to fetch dev credentials');
    }
  });
  return promise;
}

function getSignature(method) {
  var md5 = CRYPTO.createHash('md5');
  var currentTime = MOMENT.utc().format('YYYYMMDDHHmmss');

  return fetchCredentials().then(function(credentials) {
    md5.update(credentials.devId + method + credentials.devKey + currentTime);
    return {'sig': md5.digest('hex'), 'time': currentTime};
  });
}

function request(method, sig, time, param) {
  var promise = new Parse.Promise();
  fetchCredentials().then(function(credentials) {
    if (request.session === undefined) {
      request.session = new SMITE_API_SESSION(credentials.devId, credentials.devKey);
    }
    request.session.getSession().then(function(sessionId) {
      //Log request to console
      console.log('http://api.smitegame.com/smiteapi.svc/' + method + 'JSON/' + credentials.devId + '/' + sig + '/' + sessionId + '/' + time + '/' + param);

      Parse.Cloud.httpRequest(
      {
        url:'http://api.smitegame.com/smiteapi.svc/' + method + 'JSON/' + credentials.devId + '/' + sig + '/' + sessionId + '/' + time + '/' + param,
        headers: {
          'Content-Type': 'application/json'
        },
        success: function(httpResponse) {
          var response = httpResponse.data;
          if (response[0].ret_msg !== null) {
            console.warn(response[0].ret_msg);
          }
          promise.resolve(response);
        },
        error: function() {
          promise.reject('Smite server down');
        }
      });
    }, function(error) {
      promise.reject(error);
    });
  });
  return promise;
}

function methodRequest(method, param) {
  var promise = new Parse.Promise();
  getSignature(method).then(function(sigTime) {
    request(method, sigTime.sig, sigTime.time, param).then(function(items) {
      promise.resolve(items);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
}

exports.getItems = function() {
  return methodRequest('getitems', 1);
};

exports.getPlayer = function(playerName) {
  return methodRequest('getplayer', playerName);
};

exports.getMatchDetails = function(matchID) {
  return methodRequest('getmatchdetails', matchID);
};

exports.getMatchHistory = function(playerName) {
  return methodRequest('getmatchhistory', playerName);
};

exports.getQueueStats = function(playerName, queue) {
  return methodRequest('getqueuestats', playerName + '/' + queue);
};

exports.getDataUsed = function() {
  return methodRequest('getdataused', '');
};

exports.getGods = function() {
  return methodRequest('getgods', '1');
};

exports.searchTeams = function(searchTerm) {
  return methodRequest('searchteams', searchTerm);
};

exports.getTeamMatchHistory = function(teamID) {
  return methodRequest('getteammatchhistory', teamID);
};

exports.getTeamPlayers = function(teamID) {
  return methodRequest('getteamplayers', teamID);
};

exports.getTeamDetails = function(teamID) {
  return methodRequest('getteamdetails', teamID);
};
