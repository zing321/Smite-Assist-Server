'use strict';
var _ = require('cloud/vendor/underscore.js');

//Tables that must be updated first in any order
var UPDATE_ROOT_TABLES = [
	require('cloud/commands/database/UpdateGodTable.js'),
	require('cloud/commands/database/UpdateItemTable.js'),
];

//Tables that need to be updated after UPDATE_ROOT_TABLES
var UPDATE_BRANCH_TABLES = [
	require('cloud/commands/database/UpdateAbilityTable.js'),
];

//Tables that need to be updated in any order after updating root tables
var UPDATE_LEAF_TABLES = [
	require('cloud/commands/database/UpdateGodImageTable.js'),
	require('cloud/commands/database/UpdateAbilityImageTable.js'),
	require('cloud/commands/database/UpdateItemImageTable.js'),
	require('cloud/commands/database/UpdateItemHierarchy.js'),
];

function updateTablesInParallel(tables) {
  var promises = [];
  _.each(tables, function(updater) {
    promises.push(updater.updateTable());
  });

  return Parse.Promise.when(promises);
}

function updateTablesInSeries(tables) {
  var promise = Parse.Promise.as();
  _.each(tables, function(updater) {
    promise = promise.then(function() {
      return updater.updateTable();
    });
  });
  return promise;
}

Parse.Cloud.job('updateTables', function(request, status) {
  //Update root tables in parallel
  updateTablesInParallel(UPDATE_ROOT_TABLES).then(function() {
    //Update branch tables in series for now
    return updateTablesInSeries(UPDATE_BRANCH_TABLES);
  }).then(function() {
    //Update leaf tables in parallel
    return updateTablesInParallel(UPDATE_LEAF_TABLES);
  }).then(function() {
    console.log('Updated tables!');
    status.success('Updated tables!');
  },
	function(error) {
  console.error('Error updating tables: ' + error);
  status.error('Error updating tables: ' + error);
	});
});
