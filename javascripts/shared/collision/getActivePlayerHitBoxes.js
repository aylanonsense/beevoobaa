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
				new HitBox({ offsetX: 20, offsetY: -30, width: 20, height: 20,
					orientationX: -1, orientationY: 1, type: 'sweet' }),
				new HitBox({ offsetX: 5, offsetY: -40, width: 50, height: 50,
					orientationX: -1, orientationY: 1, type: 'good' }),
				new HitBox({ offsetX: -15, offsetY: -40, width: 20, height: 50,
					orientationX: -1, orientationY: 1, type: 'sour' }),
				new HitBox({ offsetX: 55, offsetY: -40, width: 20, height: 50,
					orientationX: -1, orientationY: 1, type: 'sour' })
			], end: 59 / 60 }
		],
		spike: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: 35, offsetY: -30, width: 20, height: 20,
					orientationX: -1, orientationY: 0, type: 'sweet' }),
				new HitBox({ offsetX: 15, offsetY: -50, width: 45, height: 55,
					orientationX: -1, orientationY: 0, type: 'good' }),
				new HitBox({ offsetX: 0, offsetY: -60, width: 30, height: 30,
					orientationX: -1, orientationY: 0, type: 'sour' }),
				new HitBox({ offsetX: 25, offsetY: 0, width: 30, height: 30,
					orientationX: -1, orientationY: 0, type: 'sour' })
			], end: 59 / 60 }
		],
		set: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: -10, offsetY: -60, width: 20, height: 20,
					orientationX: 0, orientationY: 1, type: 'sweet' }),
				new HitBox({ offsetX: -30, offsetY: -70, width: 60, height: 40,
					orientationX: 0, orientationY: 1, type: 'good' }),
				new HitBox({ offsetX: -50, offsetY: -70, width: 30, height: 40,
					orientationX: 0, orientationY: 1, type: 'sour' }),
				new HitBox({ offsetX: 20, offsetY: -70, width: 30, height: 40,
					orientationX: 0, orientationY: 1, type: 'sour' })
			], end: 59 / 60 }
		],
		block: [
			{ start: 3 / 60, hitBoxes: [
				new HitBox({ offsetX: 25, offsetY: -30, width: 20, height: 35,
					orientationX: -1, orientationY: 0, type: 'sweet' }),
				new HitBox({ offsetX: 15, offsetY: -40, width: 45, height: 65,
					orientationX: -1, orientationY: 0, type: 'good' }),
				new HitBox({ offsetX: 0, offsetY: -50, width: 30, height: 30,
					orientationX: -1, orientationY: 0, type: 'sour' }),
				new HitBox({ offsetX: 0, offsetY: 0, width: 30, height: 30,
					orientationX: -1, orientationY: 0, type: 'sour' })
			], end: 59 / 60 }
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