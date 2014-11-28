if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants',
	'client/phys-example/Ball'
], function(
	Constants,
	Ball
) {
	var PHYSICS_STEPS_PER_FRAME = 5;
	var balls = [
		new Ball(250, 200, 0, 100),
		new Ball(400, 215, -100, 0),
		new Ball(300, 300, 150, 150),
		new Ball(500, 500, -300, -100)
	];

	function tick(t) {
		for(var i = 0; i < balls.length; i++) {
			balls[i].physics.planMovement(t);
		}
		for(var step = 0; step < PHYSICS_STEPS_PER_FRAME; step++) {
			for(i = 0; i < balls.length; i++) {
				balls[i].physics.move(t / PHYSICS_STEPS_PER_FRAME);
				if(balls[i].physics.pos.x - balls[i].physics.radius < 0) {
					balls[i].physics.pos.x = balls[i].physics.radius;
					if(balls[i].physics.vel.x < 0) {
						balls[i].physics.vel.x *= -1;
					}
				}
				else if(balls[i].physics.pos.x + balls[i].physics.radius > Constants.CANVAS_WIDTH) {
					balls[i].physics.pos.x = Constants.CANVAS_WIDTH - balls[i].physics.radius;
					if(balls[i].physics.vel.x > 0) {
						balls[i].physics.vel.x *= -1;
					}
				}
				if(balls[i].physics.pos.y - balls[i].physics.radius < 0) {
					balls[i].physics.pos.y = balls[i].physics.radius;
					if(balls[i].physics.vel.y < 0) {
						balls[i].physics.vel.y *= -1;
					}
				}
				else if(balls[i].physics.pos.y + balls[i].physics.radius > Constants.CANVAS_HEIGHT) {
					balls[i].physics.pos.y = Constants.CANVAS_HEIGHT - balls[i].physics.radius;
					if(balls[i].physics.vel.y > 0) {
						balls[i].physics.vel.y *= -1;
					}
				}
			}
			for(i = 0; i < balls.length; i++) {
				for(j = i + 1; j < balls.length; j++) {
					balls[i].physics.handleCollision(balls[j].physics);
				}
			}
		}
		for(i = 0; i < balls.length; i++) {
			balls[i].tick(t);
			balls[i].physics.vel.y += 10;
		}
	}

	function render(ctx) {
		for(var i = 0; i < balls.length; i++) {
			balls[i].render(ctx);
		}
	}

	return {
		tick: tick,
		render: render
	};
});