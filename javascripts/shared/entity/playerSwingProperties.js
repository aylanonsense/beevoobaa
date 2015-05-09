define([
	'shared/hit/HitBox',
	'shared/math/Vector'
], function(
	HitBox,
	Vector
) {
	function createOnHitFunc() {
		return function() {
			return {
				velX: -50,
				velY: -150,
				spin: -50,
				power: 0,
				team: null
			};
		};
	}

	function bump(player, ball) {
		var vel = new Vector(ball.velX, ball.velY);
		var angle = (new Vector(1, -0.5 * player.aim)).angle();
		vel.rotate(angle);
		if(vel.y > 0) {
			vel.y *= -1;
		}
		else if(angle !== 0) {
			vel.x *= -1;
		}
		var addedVel = -75 - 100 * player.charge;
		vel.y = Math.min(vel.y, addedVel) * 0.75 + Math.max(vel.y, addedVel) * 0.25;
		vel.unrotate(angle);
		return {
			velX: vel.x,
			velY: vel.y,
			spin: ball.spin,
			power: ball.power,
			team: ball.team
		};
	}

	return {
		bump: {
			isGrounded: true,
			swingTime: 45 / 60,
			swingSuccessTime: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				/*new HitBox({
					isSweet: true,
					offsetX: 20, offsetY: -30, width: 20, height: 20,
					orientationX: -1, orientationY: 1,
					onHitFunc: createOnHitFunc()
				}),*/
				new HitBox({
					offsetX: 5, offsetY: -40, width: 50, height: 50,
					orientationX: -1, orientationY: 1,
					onHitFunc: bump
				})/*,
				new HitBox({
					isSour: true,
					offsetX: -15, offsetY: -40, width: 20, height: 50,
					orientationX: -1, orientationY: 1,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: 55, offsetY: -40, width: 20, height: 50,
					orientationX: -1, orientationY: 1,
					onHitFunc: createOnHitFunc()
				})*/
			]
		}, set: {
			isGrounded: true,
			swingTime: 45 / 60,
			swingSuccessTime: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({
					isSweet: true,
					offsetX: -10, offsetY: -60, width: 20, height: 20,
					orientationX: 0, orientationY: 1,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					offsetX: -30, offsetY: -70, width: 60, height: 40,
					orientationX: 0, orientationY: 1,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: -50, offsetY: -70, width: 30, height: 40,
					orientationX: 0, orientationY: 1,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: 20, offsetY: -70, width: 30, height: 40,
					orientationX: 0, orientationY: 1,
					onHitFunc: createOnHitFunc()
				})
			]
		}, spike: {
			isGrounded: false,
			swingTime: 45 / 60,
			swingSuccessTime: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({
					isSweet: true,
					offsetX: 35, offsetY: -30, width: 20, height: 20,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					offsetX: 15, offsetY: -50, width: 45, height: 55,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: 0, offsetY: -60, width: 30, height: 30,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: 25, offsetY: 0, width: 30, height: 30,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				})
			]
		}, block: {
			isGrounded: false,
			swingTime: 45 / 60,
			swingSuccessTime: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				new HitBox({
					isSweet: true,
					offsetX: 25, offsetY: -30, width: 20, height: 35,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					offsetX: 15, offsetY: -40, width: 45, height: 65,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: 0, offsetY: -50, width: 30, height: 30,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),
				new HitBox({
					isSour: true,
					offsetX: 0, offsetY: 0, width: 30, height: 30,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				})
			]
		}
	};
});