define([
	'shared/hit/HitBox'
], function(
	HitBox
) {
	return {
		bump: {
			isGrounded: true,
			swingDuration: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({ offsetX: 20,  offsetY: -30, width: 20, height: 20, orientationX: -1, orientationY: 1, isSweet: true }),
				new HitBox({ offsetX: 5,   offsetY: -40, width: 50, height: 50, orientationX: -1, orientationY: 1 }),
				new HitBox({ offsetX: -15, offsetY: -40, width: 20, height: 50, orientationX: -1, orientationY: 1, isSour: true }),
				new HitBox({ offsetX: 55,  offsetY: -40, width: 20, height: 50, orientationX: -1, orientationY: 1, isSour: true })
			]
		}, set: {
			isGrounded: true,
			swingDuration: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({ offsetX: -10, offsetY: -60, width: 20, height: 20, orientationX: 0, orientationY: 1, isSweet: true }),
				new HitBox({ offsetX: -30, offsetY: -70, width: 60, height: 40, orientationX: 0, orientationY: 1 }),
				new HitBox({ offsetX: -50, offsetY: -70, width: 30, height: 40, orientationX: 0, orientationY: 1, isSour: true }),
				new HitBox({ offsetX: 20,  offsetY: -70, width: 30, height: 40, orientationX: 0, orientationY: 1, isSour: true })
			]
		}, spike: {
			isGrounded: false,
			swingDuration: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({ offsetX: 35, offsetY: -30, width: 20, height: 20, orientationX: -1, orientationY: 0, isSweet: true }),
				new HitBox({ offsetX: 15, offsetY: -50, width: 45, height: 55, orientationX: -1, orientationY: 0 }),
				new HitBox({ offsetX: 0,  offsetY: -60, width: 30, height: 30, orientationX: -1, orientationY: 0, isSour: true }),
				new HitBox({ offsetX: 25, offsetY: 0,   width: 30, height: 30, orientationX: -1, orientationY: 0, isSour: true })
			]
		}, block: {
			isGrounded: false,
			swingDuration: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({ offsetX: 25, offsetY: -30, width: 20, height: 35, orientationX: -1, orientationY: 0, isSweet: true }),
				new HitBox({ offsetX: 15, offsetY: -40, width: 45, height: 65, orientationX: -1, orientationY: 0 }),
				new HitBox({ offsetX: 0,  offsetY: -50, width: 30, height: 30, orientationX: -1, orientationY: 0, isSour: true }),
				new HitBox({ offsetX: 0,  offsetY: 0,   width: 30, height: 30, orientationX: -1, orientationY: 0, isSour: true })
			]
		}
	};
});