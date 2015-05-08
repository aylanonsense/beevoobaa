define([
	'shared/utils/isServerSide'
], function(
	isServerSide
) {
	//the server uses the performance-now npm module that acts like performance.now()
	if(isServerSide) {
		var performanceNow = require('performance-now');
		return function() {
			return performanceNow() / 1000;
		};
	}

	//the client just uses performance.now()
	else {
		return function() {
			return performance.now() / 1000;
		};
	}
});