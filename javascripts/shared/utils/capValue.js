define(function() {
	return function(min, val, max) {
		return Math.max(min, Math.min(val, max));
	};
});