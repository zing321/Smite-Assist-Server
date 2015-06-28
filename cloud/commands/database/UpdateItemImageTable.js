'use strict';
var _ = require('cloud/vendor/underscore.js');
var ENUMS = require('cloud/Enums.js');
var HELPER = require('cloud/commands/CommandHelper.js');
var SMITE_API = require('cloud/SmiteAPI.js');

function setImageChain(url, obj, field, item, fileName) {
  return HELPER.setImage(url, obj, field, fileName).then(function() {
    return [obj, item];
  });
}

function fetchServerObjectChain(item) {
  return HELPER.fetchServerObject(ENUMS.Table.itemImage, ENUMS.Table.item, item).then(function(itemImageObj) {
    return [itemImageObj, item];
  });
}

function setItemImages(items, itemObjects) {
  var promises = [];
  _.each(itemObjects, function(itemObject) {
    promises.push(fetchServerObjectChain(itemObject).then(function(chainData) {
      var item = _.findWhere(items, {ItemId: chainData[1].get('ItemId')});
      var fileName = item.IconId + '.jpg';
      return setImageChain(ENUMS.Url.itemIcon + fileName, chainData[0], 'Icon', chainData[1], fileName);
    }).then(function(chainData2) {
      chainData2[0].set(ENUMS.Table.item, chainData2[1]);
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
  var itemObjects;
  return HELPER.fetchAllServerObjects(ENUMS.Table.item)
    .then(function(objects) {
      itemObjects = objects;
      return SMITE_API.getItems();
    }).then(function(items) {
      return setItemImages(items, itemObjects);
    });
};

Parse.Cloud.job('updateItemImageTable', function(request, status) {
  exports.updateTable().then(function() {
    console.log('Updated item image table');
    status.success('Updated item image table');
  },
	function(error) {
  console.error('Error item image table: ' + error);
  status.error('Error item image table: ' + error);
	});
});
