define([
	'shared/collision/HitBox',
	'shared/Constants'
], function(
	HitBox,
	SharedConstants
) {
	var SWING_HITBOXES = {
		bump: [
			{ start: 0 / 60, hitBoxes: [
				new HitBox({ offsetX: 100, offsetY: 0, width: 50, height: 75,
					vectorX: 1, vectorY: 0 })
			] },
			{ start: 20 / 60, hitBoxes: [
				new HitBox({ offsetX: 100, offsetY: -50, width: 50, height: 75,
					vectorX: 1, vectorY: 0 })
			], end: 30 / 60 }
		],
		spike: [
			{ start: 0 / 60, hitBoxes: [
				new HitBox({ offsetX: 100, offsetY: 0, width: 50, height: 75,
					vectorX: 1, vectorY: 0 })
			] },
			{ start: 20 / 60, hitBoxes: [
				new HitBox({ offsetX: 100, offsetY: -50, width: 50, height: 75,
					vectorX: 1, vectorY: 0 })
			], end: 30 / 60 }
		],
		set: [],
		block: []
	};

	//precalculate hitbox end times where end time is implied but not specified
	for(var k in SWING_HITBOXES) {
		for(var i = 0; i < SWING_HITBOXES[k].length - 1; i++) {
			if(!SWING_HITBOXES[k][i].end) {
				SWING_HITBOXES[k][i].end = SWING_HITBOXES[k][i + 1].start;
			}
		}
	}

	return function getActivePlayerHitBoxes(player) {
		//if the player is swining, there might be active hit boxes
		if(player.currentTask === 'swinging') {
			//find the active hit boxes
			var swingTime = player.currentTaskTime - 0.5 / SharedConstants.FRAME_RATE;
			var hitBoxPossibilities = SWING_HITBOXES[player.currentHit];
			for(var i = 0; i < hitBoxPossibilities.length; i++) {
				if(hitBoxPossibilities[i].start <= swingTime &&
					(!hitBoxPossibilities[i].end || hitBoxPossibilities[i].end > swingTime)) {
					//we found the active hitbox!
					return hitBoxPossibilities[i].hitBoxes;
				}
			}
		}

		//we found NOTHING! (no active hitboxes)
		return null;
	};
});