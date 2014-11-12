if (typeof define !== 'function') { var define = require('amdefine')(module); }
define({
	SPEEDOMETER: {
		imagePath: '/image/consoles.gif',
		width: 55,
		height: 27,
		scale: 4,
		flip: false,
		crop: { x: 0, y: 0, width: 275, height: 216 },
		loadingColor: '#444'
	},
	POWER_LEVEL: {
		imagePath: '/image/consoles.gif',
		width: 15,
		height: 43,
		scale: 4,
		flip: false,
		crop: { x: 0, y: 216, width: 150, height: 172 },
		loadingColor: '#444'
	},
	THRUST_LEVEL: {
		imagePath: '/image/consoles.gif',
		width: 63,
		height: 9,
		scale: 4,
		flip: false,
		crop: { x: 0, y: 216, width: 252, height: 135 },
		loadingColor: '#444'
	}
});