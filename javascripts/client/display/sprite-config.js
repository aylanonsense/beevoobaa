define({
	Athlete: {
		imagePath: '/image/sprites.gif',
		width: 24,
		height: 24,
		scale: 4,
		flip: true,
		crop: { x: 1, y: 1, width: 144, height: 432 },
		trim: { x: 7, y: 6, width: 7, height: 16 }
	},
	AthleteShadow: {
		imagePath: '/image/sprites.gif',
		width: 24,
		height: 24,
		scale: 4,
		flip: true,
		crop: { x: 181, y: 1, width: 144, height: 432 },
		trim: { x: 7, y: 6, width: 7, height: 16 }
	},
	Ball: {
		imagePath: '/image/sprites.gif',
		width: 17,
		height: 17,
		scale: 4,
		flip: false,
		crop: { x: 146, y: 1, width: 34, height: 68 },
		trim: { x: 3, y: 3, width: 11, height: 11 }
	},
	BallShadow: {
		imagePath: '/image/sprites.gif',
		width: 17,
		height: 17,
		scale: 4,
		flip: false,
		crop: { x: 326, y: 1, width: 34, height: 68 },
		trim: { x: 3, y: 3, width: 11, height: 11 }
	},
	Cursor: {
		imagePath: '/image/sprites.gif',
		width: 5,
		height: 5,
		scale: 4,
		flip: false,
		crop: { x: 146, y: 70, width: 10, height: 10 },
		trim: { x: 1, y: 1, width: 3, height: 3 }
	},
	Net: {
		imagePath: '/image/sprites.gif',
		width: 9,
		height: 47,
		scale: 4,
		flip: false,
		crop: { x: 146, y: 81, width: 9, height: 53 },
		trim: { x: 2, y: 2, width: 5, height: 33 }
	}
});