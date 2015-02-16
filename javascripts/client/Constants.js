define({
	TARGET_FRAME_RATE: 60,
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 600,
	KEY_BINDINGS: {
		32: 'JUMP', //space bar
		90: 'STRONG_HIT', //z key
		38: 'MOVE_UP', 87: 'MOVE_UP', //up arrow key / w key
		37: 'MOVE_LEFT', 65: 'MOVE_LEFT', //left arrow key / a key
		40: 'MOVE_DOWN', 83: 'MOVE_DOWN', //down arrow key / s key
		39: 'MOVE_RIGHT', 68: 'MOVE_RIGHT' //right arrow key / d key
	},
	DEBUG_RENDER_HITBOXES: true,
	DEBUG_RENDER_NETWORK: false,
	DEBUG_HIDE_SPRITES: false,
	DEBUG_TRACE_SPRITES: false,
	DEBUG_TRACE_ENTITIES: false,
	DEBUG_RENDER_SERVER_GHOSTS: true,
	DEBUG_RENDER_FUTURE_GHOSTS: false
});