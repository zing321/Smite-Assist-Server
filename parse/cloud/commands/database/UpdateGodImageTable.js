var _ = require('underscore');
var ENUMS = require("cloud/Enums.js");
var SMITE_API = require("cloud/SmiteAPI.js");
var HELPER = require("cloud/commands/CommandHelper.js");

setGodImages=function(gods)
{
	var promises = []
	_.each(gods, function(god){
		var id = god.get("GodId")
		promises.push(fetchServerObjectChain(god).then(function(chainData){
			var fileName = chainData[1].get("GodId") + ".jpg"
			return setImageChain(ENUMS.Url.godIcon + fileName, chainData[0], "Icon", chainData[1], fileName)
		}).then(function(chainData2){		
		 	var fileName = chainData2[1].get("GodId") + "c.jpg"	
			return setImageChain(ENUMS.Url.godCard + fileName, chainData2[0], "Card", chainData2[1], fileName)
		}).then(function(chainData3){
			chainData3[0].set(ENUMS.Table.god, chainData3[1]);
			return chainData3[0].save();
		}));
	});
	return Parse.Promise.when(promises);
}



fetchServerObjectChain=function(god)
{
	return HELPER.fetchServerObject(ENUMS.Table.godImage, ENUMS.Table.god, god).then(function(godImageObj){
		return [godImageObj, god];

	});
}

setImageChain=function(url, obj, field, god, fileName)
{
	return HELPER.setImage(url, obj, field, fileName).then(function(result){
		return [obj, god];
	});
}

exports.updateTable=function(){
	return HELPER.fetchAllServerObjects(ENUMS.Table.god).then(setGodImages);
}

Parse.Cloud.job("updateGodImageTable", function(request, status){
	console.log("updating images")
	exports.updateTable().then(function(objs){
		console.log("Updated god image table");
		status.success("Updated god image table");
	},
	function(error){
		console.error("Error god image table: " + error);
		status.error("Error god image table: " + error);
	});
});