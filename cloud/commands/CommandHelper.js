'use strict';
var CRYPTO = require('crypto');

exports.handle = function(promise, response) {
  promise.then(function(result) {
    response.success(result);
  },
  function(error) {
    console.error(error);
    response.error(error);
  });
};

exports.fetchAllServerObjects = function(dbName) {
  var extension = Parse.Object.extend(dbName);
  var query = new Parse.Query(extension);
  var promise = new Parse.Promise();
  query.find({
    success: function(results) {
      promise.resolve(results);
    },
    error: function() {
      promise.reject('Error fetching all from ' + dbName + ' table');
    }
  });

  return promise;
};

exports.fetchServerObject = function(dbName, idKey, idValue) {
  var promise = new Parse.Promise();
  var extension = Parse.Object.extend(dbName);
  var query = new Parse.Query(extension);
  query.equalTo(idKey, idValue);
  query.find({
    success: function(results) {
      if (results.length > 0) {
        promise.resolve(results[0]);
      } else {
        promise.resolve(new Parse.Object(dbName));
      }
    },
    error: function() {
      promise.reject('Error fetching from ' + dbName + ', with id: ' + idValue);
    }
  });
  return promise;
};

var getImageFromUrl = function(nUrl) {
  var promise = new Parse.Promise();
  Parse.Cloud.httpRequest({
    url: nUrl,
    headers:{
      'Content-Type': 'image/jpeg'
    },
    success: function(httpResponse) {
      var image = httpResponse.buffer;
      var md5 = CRYPTO.createHash('md5');
      md5.update(image);
      var md5sum = md5.digest('hex');
      promise.resolve([image, md5sum]);
    },
    error: function(error) {
      var errorString = 'Error ' + error.status + ' in getting image: ' + nUrl;
      console.log(errorString);
      promise.reject(errorString);
    }
  });

  return promise;
};

exports.setImage = function(url, obj, field, fileName) {
  return getImageFromUrl(url).then(function(imageData) {
    if (obj.get(field + 'Checksum') !== imageData[1]) {
      console.log('updating ' + field + ' ' + fileName);
      var parseFile = new Parse.File(fileName, {base64: imageData[0].toString('base64', 0, imageData[0].length)});
      return parseFile.save().then(function() {
        obj.set(field + 'Checksum', imageData[1]);
        obj.set(field, parseFile);
      });
    }
  });
};
