'use strict';
var _ = require('underscore');
var SMITE_API = require('cloud/SmiteAPI.js');
var ENUMS = require('cloud/Enums.js');

var setServerItems = function(items) {
  var saveArray = [];
  _.each(items, function(item) {
    var itemsObject = new Parse.Object(ENUMS.Table.item);
    itemsObject.set('Name', item.DeviceName);
    itemsObject.set('Description', item.ItemDescription.Description);
    itemsObject.set('SecondaryDescription', item.ItemDescription.SecondaryDescription);
    itemsObject.set('ItemId', item.ItemId);
    itemsObject.set('Price', item.Price);
    itemsObject.set('ShortDesc', item.ShortDesc);
    itemsObject.set('Type', item.Type);

    _.each(item.ItemDescription.Menuitems, function(menuItem) {
      itemsObject.add('Traits', menuItem);
    });
    saveArray.push(itemsObject);
  });
  return Parse.Object.saveAll(saveArray);
};

exports.updateTable = function() {

  return SMITE_API.getItems().then(function(items) {
    return setServerItems(items);
  });
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
