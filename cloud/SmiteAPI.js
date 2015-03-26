//static "class"
var SMITE_API_SESSION=require("cloud/SmiteAPISession.js");
var MOMENT=require('moment');
var CRYPTO=require('crypto');

var DEV_ID="1112"
var DEV_KEY="7658A4481DC24B6FB2875A8DBA23EF74"

function getSignature(method)
{
	var md5 = CRYPTO.createHash('md5');
	var currentTime=MOMENT.utc().format("YYYYMMDDHHmmss")
	md5.update(DEV_ID+method+DEV_KEY+currentTime);
	return md5.digest('hex');
}
function request(method, sig, param)
{
	var session=new SMITE_API_SESSION(DEV_ID,DEV_KEY);
	var promise=new Parse.Promise();
	var response;
	session.getSession().then(function(sessionId){
		console.log("http://api.smitegame.com/smiteapi.svc/"+method+"JSON/"+DEV_ID+"/"+sig+"/"+sessionId+"/"+MOMENT.utc().format("YYYYMMDDHHmmss")+"/"+param);
		Parse.Cloud.httpRequest(
		{
			url:"http://api.smitegame.com/smiteapi.svc/"+method+"JSON/"+DEV_ID+"/"+sig+"/"+sessionId+"/"+MOMENT.utc().format("YYYYMMDDHHmmss")+"/"+param,
			headers: {
				'Content-Type': 'application/json'
			},
			success: function(httpResponse)
			{
				var response = httpResponse.data;
				if(response[0].ret_msg != null)
				 	console.warn(response[0].ret_msg);
				promise.resolve(response);
			},
			error: function(error)
			{
				promise.reject("Smite server down");
			}
		});
	},function(error)
	{
		promise.reject(error);
	});
	return promise;
}

exports.getItems=function()
{
	var promise=new Parse.Promise();
	var method="getitems"
	var sig=getSignature(method);
	var param="1"
	request(method,sig,param).then(function(items)
	{
		promise.resolve(items);
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise;
}
exports.getPlayer=function(playerName)
{
	var promise=new Parse.Promise();
	var method="getplayer"
	var sig=getSignature(method);
	request(method,sig,playerName).then(function(player)
	{
		promise.resolve(player)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getMatchDetails=function(matchID)
{
	var promise=new Parse.Promise();
	var method="getmatchdetails"
	var sig=getSignature(method);
	request(method,sig,matchID).then(function(match)
	{
		promise.resolve(match);
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise;
}
exports.getMatchHistory=function(playerName)
{
	var promise=new Parse.Promise();
	var method="getmatchhistory"
	var sig=getSignature(method);
	request(method,sig,playerName).then(function(matches)
	{
		promise.resolve(matches)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getQueueStats=function(playerName, queue)
{
	var promise=new Parse.Promise();
	var method="getqueuestats"
	var sig=getSignature(method);
	var param=playerName+"/"+queue
	request(method,sig,param).then(function(stats)
	{
		promise.resolve(stats)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getDataUsed=function()
{
	var promise=new Parse.Promise();
	var method="getdataused"
	var sig=getSignature(method);
	var param="";
	request(method,sig,param).then(function(details)
	{
		promise.resolve(details)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getGods=function()
{
	var promise=new Parse.Promise();
	var method="getgods"
	var sig=getSignature(method);
	var param="1";
	request(method,sig,param).then(function(matches)
	{
		promise.resolve(matches)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
//
// Depricated by getmatchdetails
//
// exports.getDemoDetails=function(matchID)
// {
// 	var promise=new Parse.Promise();
// 	var method="getdemodetails"
// 	var sig=getSignature(method);
// 	request(method,sig,matchID).then(function(details)
// 	{
// 		promise.resolve(details)
// 	},
// 	function(error)
// 	{
// 		promise.reject(error);
// 	});
// 	return promise
// }
exports.searchTeams=function(searchTerm)
{
	var promise=new Parse.Promise();
	var method="searchteams"
	var sig=getSignature(method);
	request(method,sig,searchTerm).then(function(teams)
	{
		promise.resolve(teams)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getTeamMatchHistory=function(teamID)
{
	var promise=new Parse.Promise();
	var method="getteammatchhistory"
	var sig=getSignature(method);
	request(method,sig,teamID).then(function(matches)
	{
		promise.resolve(matches)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getTeamPlayers=function(teamID)
{
	var promise=new Parse.Promise();
	var method="getteamplayers"
	var sig=getSignature(method);
	request(method,sig,teamID).then(function(players)
	{
		promise.resolve(players)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
exports.getTeamDetails=function(teamID)
{
	var promise=new Parse.Promise();
	var method="getteamdetails"
	var sig=getSignature(method);
	request(method,sig,teamID).then(function(details)
	{
		promise.resolve(details)
	},
	function(error)
	{
		promise.reject(error);
	});
	return promise
}
