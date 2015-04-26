'use strict';
var SMITE_API = require('cloud/SmiteAPI.js');
var HELPER = require('cloud/commands/CommandHelper.js');

Parse.Cloud.define('getPlayer', function(request, response) {
  HELPER.handle(SMITE_API.getPlayer(request.params.player), response);
});

Parse.Cloud.define('getMatchHistory', function(request, response) {
  HELPER.handle(SMITE_API.getMatchHistory(request.params.player), response);
});

Parse.Cloud.define('getMatchDetails', function(request, response) {
  HELPER.handle(SMITE_API.getMatchDetails(request.params.matchId), response);
});

Parse.Cloud.define('getQueueStats', function(request, response) {
  HELPER.handle(SMITE_API.getQueueStats(request.params.player, request.params.queue), response);
});

Parse.Cloud.define('getTopRanked', function(request, response) {
  HELPER.handle(SMITE_API.getTopRanked(), response);
});
