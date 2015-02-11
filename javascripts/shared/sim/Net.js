define([
	'shared/sim/LocatableSim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	function Net(params, simType) {
		params.width = 20;
		params.height = 96;
		SUPERCLASS.call(this, params, simType);

		//automatically repositions itself
		this.centerX = SharedConstants.BOUNDS.LEFT_WALL +
			(SharedConstants.BOUNDS.RIGHT_WALL - SharedConstants.BOUNDS.LEFT_WALL) / 2;
		this.bottom = SharedConstants.BOUNDS.FLOOR;
	}
	Net.prototype = Object.create(SUPERCLASS.prototype);
	return Net;
});