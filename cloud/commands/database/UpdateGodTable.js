'use strict';
var _ = require('cloud/vendor/underscore.js');
var SMITE_API = require('cloud/SmiteAPI.js');
var HELPER = require('cloud/commands/CommandHelper.js');
var ENUMS = require('cloud/Enums.js');

var fetchServerGod = function(god) {
  return HELPER.fetchServerObject(ENUMS.Table.god, 'GodId', god.id).then(function(result) {
    return [result, god];
  });
};

var setServerGods = function(gods) {
  var saveArray = [];
  var promises = [];
  _.each(gods, function(aGod) {
    promises.push(fetchServerGod(aGod).then(function(results) {
      var godsObject = results[0];
      var god = results[1];
      godsObject.clear();
      godsObject.set('AttackSpeed', god.AttackSpeed);
      godsObject.set('AttackSpeedPerLevel', god.AttackSpeedPerLevel);

      _.each(god.basicAttack.itemDescription.menuitems, function(item) {
        godsObject.add('BasicAttack', item);
      });

      godsObject.set('HP5PerLevel', god.HP5PerLevel);
      godsObject.set('Health', god.Health);
      godsObject.set('HealthPerFive', god.HealthPerFive);
      godsObject.set('HealthPerLevel', god.HealthPerLevel);
      godsObject.set('Lore', god.Lore);
      godsObject.set('MP5PerLevel', god.MP5PerLevel);
      godsObject.set('MagicProtection', god.MagicProtection);
      godsObject.set('MagicProtectionPerLevel', god.MagicProtectionPerLevel);
      godsObject.set('Mana', god.Mana);
      godsObject.set('ManaPerFive', god.ManaPerFive);
      godsObject.set('ManaPerLevel', god.ManaPerLevel);
      godsObject.set('Name', god.Name);
      godsObject.set('OnFreeRotation', Boolean(god.OnFreeRotation));
      godsObject.set('Pantheon', god.Pantheon);
      godsObject.set('PhysicalPower', god.PhysicalPower);
      godsObject.set('PhysicalPowerPerLevel', god.PhysicalPowerPerLevel);
      godsObject.set('PhysicalProtection', god.PhysicalProtection);
      godsObject.set('PhysicalProtectionPerLevel', god.PhysicalProtectionPerLevel);
      godsObject.set('MagicalPower', god.MagicalPower);
      godsObject.set('MagicalPowerPerLevel', god.MagicalPowerPerLevel);
      godsObject.set('Pros', god.Pros);
      godsObject.set('Roles', god.Roles);
      godsObject.set('Speed', god.Speed);
      godsObject.set('Type', god.Type);

      godsObject.set('GodId', god.id);
      saveArray.push(godsObject);
      return Parse.Promise.as();
    }));
  });
  return Parse.Promise.when(promises).then(function() {
    return Parse.Object.saveAll(saveArray);
  });
};

exports.updateTable = function() {
  return SMITE_API.getGods().then(setServerGods);
};

Parse.Cloud.job('updateGodTable', function(request, status) {
  exports.updateTable().then(function() {
    console.log('Updated god table');
    status.success('Updated god table');
  },
	function(error) {
  console.error('Error updating god table: ' + error.message);
  status.error('Error updating god table: ' + error.message);
	});
});
