define({
	//render
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 600,
	DEBUG_HIDE_SPRITES: false,
	DEBUG_TRACE_SPRITES: false,

	//input bindings
	KEY_BINDINGS: {
		32: 'JUMP', //space bar
		90: 'STRONG_HIT', //z key
		88: 'WEAK_HIT', //x key
		37: 'MOVE_LEFT', 65: 'MOVE_LEFT', //left arrow key / a key
		39: 'MOVE_RIGHT', 68: 'MOVE_RIGHT' //right arrow key / d key
	},

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