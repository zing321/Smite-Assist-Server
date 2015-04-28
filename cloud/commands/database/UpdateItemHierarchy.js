'use strict';
exports.updateTable = function() {
  return Parse.Promise.as();
};

Parse.Cloud.job('updateItemHierarchy', function(request, status) {
  console.log('updating item hierarchy');
  exports.updateTable().then(function() {
    console.log('Updated item hierarchy table');
    status.success('Updated item hierarchy table');
  },
	function(error) {
  console.error('Error item hierarchy table: ' + error);
  status.error('Error item hierarchy table: ' + error);
	});
});
