'use strict';
var _ = require('cloud/vendor/underscore.js');
var SMITE_API = require('cloud/SmiteAPI.js');
var ENUMS = require('cloud/Enums.js');
var HELPER = require('cloud/commands/CommandHelper.js');

function fetchServerItem(item) {
  return HELPER.fetchServerObject(ENUMS.Table.item, 'ItemId', item.ItemId).then(function(result) {
    return [result, item];
  });
}

function setItemHierarchy(items) {
  var saveArray = [];
  var promises = [];
  _.each(items, function(aItem) {
    promises.push(fetchServerItem(aItem).then(function(results) {
      var itemsObject = results[0];
      var childItem = {'ItemId': results[1].ChildItemId};
      if (childItem.ItemId !== 0) {
        return fetchServerItem(childItem).then(function(results2) {
          itemsObject.set('Child', results2[0]);
          saveArray.push(itemsObject);
          return Parse.Promise.as();
        });
      } else {
        return Parse.Promise.as();
      }
    }));
  });
  return Parse.Promise.when(promises).then(function() {
    return Parse.Object.saveAll(saveArray);
  });
}

exports.updateTable = function() {
  return SMITE_API.getItems().then(setItemHierarchy);
};

Parse.Cloud.job('updateItemHierarchy', function(request, status) {
  console.log('updating item hierarchy');
  exports.updateTable().then(function() {
    console.log('Updated item table hierarchy');
    status.success('Updated item table hierarchy');
  },
	function(error) {
  console.error('Error item table hierarchy: ' + error);
  status.error('Error item table hierarchy: ' + error);
	});
});
