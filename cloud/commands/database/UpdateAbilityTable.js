'use strict';
var _ = require('cloud/vendor/underscore.js');
var SMITE_API = require('cloud/SmiteAPI.js');
var HELPER = require('cloud/commands/CommandHelper.js');
var ENUMS = require('cloud/Enums.js');

var fetchServerAbility = function(id, name, description, passive, god) {
  return HELPER.fetchServerObject(ENUMS.Table.ability, 'AbilityId', id).then(function(result) {
    return {'obj':result, 'id':id, 'name':name, 'description':description, 'passive':passive, 'god':god};
  });
};

var setAbility = function(id, name, description, passive, god) {
  var promise = new Parse.Promise();
  fetchServerAbility(id, name, description, passive, god).then(function(result) {
    var abilityObject = result.obj;
    abilityObject.clear();
    abilityObject.set('God', result.god);
    abilityObject.set('AbilityId', result.id);
    abilityObject.set('Name', result.name);
    abilityObject.set('Cooldown', result.description.cooldown);
    abilityObject.set('Cost', result.description.cost);
    abilityObject.set('Description', result.description.description);
    abilityObject.set('SecondaryDescription', result.description.secondaryDescription);
    abilityObject.set('Passive', result.passive);

    _.each(result.description.menuitems, function(item) {
      abilityObject.add('Traits', item);
    });

    _.each(result.description.rankitems, function(item) {
      abilityObject.add('Ranks', item);
    });
    promise.resolve(abilityObject);
  }, function(error) {
    promise.reject(error);
  });

  return promise;
};

var setServerAbilities = function(gods) {
  var saveArray = [];
  var promiseArray = [];
  var dbGods = Parse.Object.extend('God');

  _.each(gods, function(god) {
    var promise = new Parse.Promise();
    promiseArray.push(promise);
    var query = new Parse.Query(dbGods);
    query.equalTo('GodId', god.id);

    query.find({
      success: function(result) {
        var promises = [];
        promises.push(setAbility(god.AbilityId1, god.Ability1, god.abilityDescription1.itemDescription, false, result[0]).then(function(obj) {saveArray.push(obj);}));
        promises.push(setAbility(god.AbilityId2, god.Ability2, god.abilityDescription2.itemDescription, false, result[0]).then(function(obj) {saveArray.push(obj);}));
        promises.push(setAbility(god.AbilityId3, god.Ability3, god.abilityDescription3.itemDescription, false, result[0]).then(function(obj) {saveArray.push(obj);}));
        promises.push(setAbility(god.AbilityId4, god.Ability4, god.abilityDescription4.itemDescription, false, result[0]).then(function(obj) {saveArray.push(obj);}));
        promises.push(setAbility(god.AbilityId5, god.Ability5, god.abilityDescription5.itemDescription, true, result[0]).then(function(obj) {saveArray.push(obj);}));

        Parse.Promise.when(promises).then(function() {
          promise.resolve(true);
        });
      },
      error: function() {
        promise.reject('Error fetching god: ' + god.id);
      }
    });

  });

  return Parse.Promise.when(promiseArray).then(function() {
    return Parse.Object.saveAll(saveArray);
  });
};

exports.updateTable = function() {
  return SMITE_API.getGods().then(setServerAbilities);
};

Parse.Cloud.job('updateAbilityTable', function(request, status) {
  exports.updateTable().then(function() {
    console.log('Updated ability table');
    status.success('Updated ability table');
  },
	function(error) {
  console.error('Error updating ability table: ' + error.message);
  status.error('Error updating ability table: ' + error.message);
	});
});
