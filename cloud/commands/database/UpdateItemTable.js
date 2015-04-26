'use strict';
var _ = require('underscore');
var SMITE_API=require('cloud/SmiteAPI.js');

var setServerItems = function(items){
  var saveArray=[];
  _.each(items, function(item){
    var itemsObject=new Parse.Object("Item");
    itemsObject.set("Root", //obj RootItemId);
    itemsObject.set("Parent", //obj ChildItemId);
    itemsObject.set("Name",item.DeviceName);
    itemsObject.set("Description",item.ItemDescription.Description);
    itemsObject.set("SecondaryDescription", item.ItemDescription.SecondaryDescription);
    itemsObject.set("ItemId",item.ItemId);
    itemsObject.set("ItemTier",item.ItemTier);
    itemsObject.set("Price",item.Price);
    itemsObject.set("RootItemId",item.RootItemId);
    itemsObject.set("ShortDesc",item.ShortDesc);

    _.each(item.ItemDescription.Menuitems, function(menuItem){
      itemsObject.add("Traits",menuItem);
    });
    saveArray.push(itemsObject);
  });
  return Parse.Object.saveAll(saveArray);
};

exports.updateTable=function(){

  return SMITE_API.getItems().then(function(items){
    return setServerItems(items);
  });
};

Parse.Cloud.job("updateItemTable", function(request, status){
  exports.updateTable().then(function(){
    console.log("Updated item table");
    status.success("Updated item table");
  },
  function(error){
    console.error("Error updating item table: " + error.message);
    status.error("Error updating item table: " + error.message);
  });
});
