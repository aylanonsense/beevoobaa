define({
	//render
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 600,

	//input bindings
	KEY_BINDINGS: {
		32: 'JUMP', //space bar
		90: 'STRONG_HIT', //z key
		88: 'WEAK_HIT', //x key
		38: 'UP', 87: 'UP', //up arrow key / w key
		40: 'DOWN', 83: 'DOWN', //down arrow key / s key
		37: 'LEFT', 65: 'LEFT', //left arrow key / a key
		39: 'RIGHT', 68: 'RIGHT' //right arrow key / d key
	},

	//simulation
	DEBUG_DISABLE_SERVER_SIMULATIONS: false,

	//simulation speed and syncing
	TIME_REQUIRED_TO_SPEED_UP_SIM: 3 / 60,
	TIME_REQUIRED_TO_SLOW_DOWN_SIM: 3 / 60,
	TIME_REQUIRED_TO_RESET: 50 / 60,
	SPEED_UP_SIM_MULT: 1.15,
	SLOW_DOWN_SIM_MULT: 0.87,

	//network
	TIME_BETWEEN_PINGS: 0.90,
	NUM_CACHED_PINGS: 20,
	PINGS_TO_IGNORE: 3,
	GAINS_REQUIRED_TO_LOWER_ROUND_TRIP_TIME: 75,
	DEBUG_DRAW_SERVER_GHOSTS: true
});