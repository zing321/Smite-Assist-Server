'use strict';
var _ = require('underscore');
var ENUMS = require('cloud/Enums.js');
var HELPER = require('cloud/commands/CommandHelper.js');

function setImageChain(url, obj, field, ability, fileName) {
  return HELPER.setImage(url, obj, field, fileName).then(function() {
    return [obj, ability];
  });
}

function fetchServerObjectChain(ability) {
  return HELPER.fetchServerObject(ENUMS.Table.abilityImage, ENUMS.Table.ability, ability).then(function(abilityImageObj) {
    return [abilityImageObj, ability];
  });
}

function setAbilityImages(abilities) {
  var promises = [];
  _.each(abilities, function(ability) {
    promises.push(fetchServerObjectChain(ability).then(function(chainData) {
      var godPointer = chainData[1].get(ENUMS.Table.god);
      return godPointer.fetch().then(function(god) {
        var fileName = god.get('GodId') + '_' + chainData[1].get('AbilityId') + '.jpg';
        return setImageChain(ENUMS.Url.abilityIcon + fileName, chainData[0], 'Icon', chainData[1], fileName);
      });
    }).then(function(chainData2) {
      chainData2[0].set(ENUMS.Table.ability, chainData2[1]);
      return chainData2[0].save();
    }).then(function() {
      //Continue
      return Parse.Promise.as();
    },
    function() {
      //On error continue with the promise stack.
      return Parse.Promise.as();
    }));
  });
  return Parse.Promise.when(promises);
}

exports.updateTable = function() {
  return HELPER.fetchAllServerObjects(ENUMS.Table.ability).then(setAbilityImages);
};

Parse.Cloud.job('updateAbilityImageTable', function(request, status) {
  exports.updateTable().then(function() {
    console.log('Updated ability image table');
    status.success('Updated ability image table');
  },
	function(error) {
  console.error('Error ability image table: ' + error);
  status.error('Error ability image table: ' + error);
	});
});
