define([
	'shared/collision/HitBox',
	'shared/Constants'
], function(
	HitBox,
	SharedConstants
) {
	var SWING_HITBOXES = {
		bump: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: 20, offsetY: -40, width: 100, height: 80,
					orientationX: -1, orientationY: 1 })
			], end: 6 / 60 }
		],
		spike: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: 10, offsetY: -50, width: 100, height: 120,
					orientationX: -1, orientationY: 0 })
			], end: 6 / 60 }
		],
		set: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: -50, offsetY: -80, width: 100, height: 70,
					orientationX: 0, orientationY: 1 })
			], end: 6 / 60 }
		],
		block: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: 10, offsetY: -60, width: 60, height: 150,
					orientationX: -1, orientationY: 0 })
			], end: 6 / 60 }
		]
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