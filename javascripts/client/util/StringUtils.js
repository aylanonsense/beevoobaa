if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	function formatNumber(num, digits) {
		var s = '' + num;
		var p = s.indexOf('.');
		if(digits === 0) {
			return (p === -1 ? s : s.substr(0, p));
		}
		else {
			if(p === -1) { s += '.'; }
			p = s.indexOf('.');
			for(var i = 0; i < digits; i++) {
				s += '0';
			}
			return s.substr(0, p + digits + 1);
		}
	}

	return {
		formatNumber: formatNumber
	};
});