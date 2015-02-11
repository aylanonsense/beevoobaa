define([
	'server/entity/Entity',
	'shared/sim/Net'
], function(
	SUPERCLASS,
	NetSim
) {
	function Net(params) {
		SUPERCLASS.call(this, 'Net', NetSim, params);
	}
	Net.prototype = Object.create(SUPERCLASS.prototype);
	Net.prototype._generateActionFromCommand = function(command, action) {
		return null;
	};
	return Net;
});