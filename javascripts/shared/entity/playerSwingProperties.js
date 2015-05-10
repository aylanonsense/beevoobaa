define([
	'shared/hit/HitBox',
	'shared/math/Vector'
], function(
	HitBox,
	Vector
) {
	function overcomePower(power, player, ball) {
		if(ball.team === null || ball.team === player.team) {
			return 0;
		}
		else {
			return Math.max(0, ball.power - power);
		}
	}

	function onBump(player, ball) {
		var power = overcomePower(30 + 65 * player.charge, player, ball);
		var team = (power === 0 ? null : ball.team);
		var vel = new Vector(ball.velX, ball.velY);
		var angle = (new Vector(1, -0.5 * player.aim)).angle();
		vel.rotate(angle);
		if(vel.y > 0) {
			vel.y *= -1;
		}
		else if(angle !== 0) {
			vel.x *= -1;
		}
		var controlledVel = -75 - 100 * player.charge;
		vel.y = Math.min(vel.y, controlledVel) * 0.75 + Math.max(vel.y, controlledVel) * 0.25;
		vel.unrotate(angle);
		return {
			velX: vel.x,
			velY: vel.y,
			spin: ball.spin + 25 * player.aim,
			power: power,
			team: team,
			freezeTime: 40 / 60
		};
	}

	function onSet(player, ball) {
		var power = overcomePower(5 + 20 * player.charge, player, ball);
		var team = (power === 0 ? null : ball.team);
		var vel = new Vector(ball.velX, ball.velY);
		if(vel.y > 0) {
			vel.y *= -1;
		}
		vel.x *= 0.5;
		vel.x += player.aim * player.charge * 35;
		var controlledVel = -60 - 90 * player.charge;
		vel.y = controlledVel * 0.75 + vel.y * 0.25;
		return {
			velX: vel.x,
			velY: vel.y,
			spin: ball.spin * 0.5,
			power: power,
			team: team,
			freezeTime: 40 / 60
		};
	}

	function onSpike(player, ball) {
		var hitPower = 20 + 50 * player.charge;
		var power, team;
		if(ball.team === player.team || ball.team === null) {
			power = Math.max(ball.power, hitPower);
			team = player.team;
		}
		else if(hitPower >= ball.power) {
			power = ball.power - hitPower;
			team = player.team;
		}
		else {
			power = ball.power - hitPower;
			team = ball.team;
		}
		var vel = new Vector(ball.velX, ball.velY);
		var angle = (new Vector(-0.7 - 0.3 * player.aim, -1)).angle();
		vel.rotate(angle);
		vel.x = 0;
		vel.y = -75 - 150 * player.charge;
		vel.unrotate(angle);
		return {
			velX: vel.x,
			velY: vel.y,
			spin: ball.spin + 20 * player.aim + 20 * player.aim * player.charge,
			power: power,
			team: team,
			freezeTime: 40 / 60
		};
	}

	function onBlock(player, ball) {
		var power = overcomePower(25 + 50 * player.charge, player, ball);
		var team = (power === 0 ? null : ball.team);
		var vel = new Vector(ball.velX, ball.velY);
		vel.x = Math.max(vel.x, 25 + 40 * player.charge);
		vel.y = 0.5 * vel.y - 10 + (10 + 20 * player.charge) * player.aim;
		return {
			velX: vel.x,
			velY: vel.y,
			spin: 0.75 * ball.spin + 10 * player.aim,
			power: power,
			team: team,
			freezeTime: 40 / 60
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
					onHitFunc: onBump
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
				/*new HitBox({
					isSweet: true,
					offsetX: -10, offsetY: -60, width: 20, height: 20,
					orientationX: 0, orientationY: 1,
					onHitFunc: createOnHitFunc()
				}),*/
				new HitBox({
					offsetX: -30, offsetY: -70, width: 60, height: 40,
					orientationX: 0, orientationY: 1,
					onHitFunc: onSet
				})/*,
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
				})*/
			]
		}, spike: {
			isGrounded: false,
			swingTime: 45 / 60,
			swingSuccessTime: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				/*new HitBox({
					isSweet: true,
					offsetX: 35, offsetY: -30, width: 20, height: 20,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),*/
				new HitBox({
					offsetX: 15, offsetY: -50, width: 45, height: 55,
					orientationX: -1, orientationY: 0,
					onHitFunc: onSpike
				})/*,
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
				})*/
			]
		}, block: {
			isGrounded: false,
			swingTime: 45 / 60,
			swingSuccessTime: 45 / 60,
			timeToMaxCharge: 90 / 60,
			activeStartTime: 3 / 60,
			activeEndTime: 56 / 60,
			hitBoxes: [
				/*new HitBox({
					isSweet: true,
					offsetX: 25, offsetY: -30, width: 20, height: 35,
					orientationX: -1, orientationY: 0,
					onHitFunc: createOnHitFunc()
				}),*/
				new HitBox({
					offsetX: 15, offsetY: -40, width: 45, height: 65,
					orientationX: -1, orientationY: 0,
					onHitFunc: onBlock
				})/*,
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
				})*/
			]
		}
	};
});