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
    return md5.digest('hex');
  });
}

function request(method, sig, param) {
  var promise = new Parse.Promise();
  fetchCredentials().then(function(credentials) {
    var session = new SMITE_API_SESSION(credentials.devId, credentials.devKey);
    session.getSession().then(function(sessionId) {
      //Log request to console
      console.log('http://api.smitegame.com/smiteapi.svc/' + method + 'JSON/' + credentials.devId + '/' + sig + '/' + sessionId + '/' + MOMENT.utc().format('YYYYMMDDHHmmss') + '/' + param);

      Parse.Cloud.httpRequest(
      {
        url:'http://api.smitegame.com/smiteapi.svc/' + method + 'JSON/' + credentials.devId + '/' + sig + '/' + sessionId + '/' + MOMENT.utc().format('YYYYMMDDHHmmss') + '/' + param,
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

exports.getItems = function() {
  var promise = new Parse.Promise();
  var method = 'getitems';
  getSignature(method).then(function(sig) {
    var param = '1';
    request(method, sig, param).then(function(items) {
      promise.resolve(items);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getPlayer = function(playerName) {
  var promise = new Parse.Promise();
  var method = 'getplayer';
  getSignature(method).then(function(sig) {
    request(method, sig, playerName).then(function(player) {
      promise.resolve(player);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getMatchDetails = function(matchID) {
  var promise = new Parse.Promise();
  var method = 'getmatchdetails';
  getSignature(method).then(function(sig) {
    request(method, sig, matchID).then(function(match) {
      promise.resolve(match);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getMatchHistory = function(playerName) {
  var promise = new Parse.Promise();
  var method = 'getmatchhistory';
  getSignature(method).then(function(sig) {
    request(method, sig, playerName).then(function(matches) {
      promise.resolve(matches);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getQueueStats = function(playerName, queue) {
  var promise = new Parse.Promise();
  var method = 'getqueuestats';
  getSignature(method).then(function(sig) {
    var param = playerName + '/' + queue;
    request(method, sig, param).then(function(stats) {
      promise.resolve(stats);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getDataUsed = function() {
  var promise = new Parse.Promise();
  var method = 'getdataused';
  getSignature(method).then(function(sig) {
    var param = '';
    request(method, sig, param).then(function(details) {
      promise.resolve(details);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getGods = function() {
  var promise = new Parse.Promise();
  var method = 'getgods';
  getSignature(method).then(function(sig) {
    var param = '1';
    request(method, sig, param).then(function(matches) {
      promise.resolve(matches);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

/*
// Depricated by getmatchdetails
//
// exports.getDemoDetails=function(matchID)
// {
//  var promise=new Parse.Promise();
//  var method='getdemodetails'
//  var sig=getSignature(method);
//  request(method,sig,matchID).then(function(details)
//  {
//    promise.resolve(details)
//  },
//  function(error)
//  {
//    promise.reject(error);
//  });
//  return promise
// }
*/

exports.searchTeams = function(searchTerm) {
  var promise = new Parse.Promise();
  var method = 'searchteams';
  getSignature(method).then(function(sig) {
    request(method, sig, searchTerm).then(function(teams) {
      promise.resolve(teams);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getTeamMatchHistory = function(teamID) {
  var promise = new Parse.Promise();
  var method = 'getteammatchhistory';
  getSignature(method).then(function(sig) {
    request(method, sig, teamID).then(function(matches) {
      promise.resolve(matches);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getTeamPlayers = function(teamID) {
  var promise = new Parse.Promise();
  var method = 'getteamplayers';
  getSignature(method).then(function(sig) {
    request(method, sig, teamID).then(function(players) {
      promise.resolve(players);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};

exports.getTeamDetails = function(teamID) {
  var promise = new Parse.Promise();
  var method = 'getteamdetails';
  getSignature(method).then(function(sig) {
    request(method, sig, teamID).then(function(details) {
      promise.resolve(details);
    },
    function(error) {
      promise.reject(error);
    });
  });
  return promise;
};
