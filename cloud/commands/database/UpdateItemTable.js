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

function setServerItems(items) {
  var saveArray = [];
  var promises = [];
  _.each(items, function(aItem) {
    promises.push(fetchServerItem(aItem).then(function(results) {
      var itemsObject = results[0];
      var item = results[1];
      itemsObject.clear();
      itemsObject.set('Name', item.DeviceName);
      itemsObject.set('Description', item.ItemDescription.Description);
      itemsObject.set('SecondaryDescription', item.ItemDescription.SecondaryDescription);
      itemsObject.set('ItemId', item.ItemId);
      itemsObject.set('Price', item.Price);
      itemsObject.set('ShortDesc', item.ShortDesc);
      itemsObject.set('Type', item.Type);

      //Set default to be a empty array
      itemsObject.Set('Traits', []);

      _.each(item.ItemDescription.Menuitems, function(menuItem) {
        itemsObject.add('Traits', menuItem);
      });

      saveArray.push(itemsObject);
      return Parse.Promise.as();
    }));
  });
  return Parse.Promise.when(promises).then(function() {
    return Parse.Object.saveAll(saveArray);
  });
}

exports.updateTable = function() {
  return SMITE_API.getItems().then(setServerItems);
};

Parse.Cloud.job('updateItemTable', function(request, status) {
  exports.updateTable().then(function() {
    console.log('Updated item table');
    status.success('Updated item table');
  },
  function(error) {
    console.error('Error updating item table: ' + error.message);
    status.error('Error updating item table: ' + error.message);
  });
});
