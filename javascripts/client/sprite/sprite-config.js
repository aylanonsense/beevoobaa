if (typeof define !== 'function') { var define = require('amdefine')(module); }
define({
	SMALL_FONT: {
		imagePath: '/image/consoles.gif',
		width: 5,
		height: 7,
		scale: 3,
		flip: false,
		crop: { x: 402, y: 325, width: 130, height: 14 },
		loadingColor: '#fff',
		outlineInDebugMode: false
	},
	SPEEDOMETER: {
		imagePath: '/image/consoles.gif',
		width: 55,
		height: 27,
		scale: 3,
		flip: false,
		crop: { x: 0, y: 0, width: 275, height: 216 },
		loadingColor: '#fff'
	},
	ENERGY_LEVEL_CONSOLE: {
		imagePath: '/image/consoles.gif',
		width: 15,
		height: 43,
		scale: 3,
		flip: false,
		crop: { x: 0, y: 216, width: 150, height: 172 },
		loadingColor: '#fff'
	},
	SHIP_POSITION_CONSOLE: {
		imagePath: '/image/consoles.gif',
		width: 66,
		height: 66,
		scale: 3,
		flip: false,
		crop: { x: 0, y: 400, width: 198, height: 132 },
		loadingColor: '#fff'
	},
	THRUST_LEVEL: {
		imagePath: '/image/consoles.gif',
		width: 63,
		height: 9,
		scale: 3,
		flip: false,
		crop: { x: 0, y: 216, width: 252, height: 135 },
		loadingColor: '#fff'
	}
});