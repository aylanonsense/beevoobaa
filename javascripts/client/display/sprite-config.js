define({
	Athlete: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 5,
		flip: true,
		crop: { x: 5, y: 7, width: 144, height: 432 },
		trim: { x: 7, y: 8, width: 7, height: 16 }
	},
	AthleteOutline: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 5,
		flip: true,
		crop: { x: 311, y: 7, width: 144, height: 432 },
		trim: { x: 7, y: 8, width: 7, height: 16 }
	},
	AthleteOutline2: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 5,
		flip: true,
		crop: { x: 311, y: 7, width: 144, height: 432 },
		trim: { x: 7, y: 8, width: 7, height: 16 },
		replacements: { '#0a5359': '#383609' }
	},
	Cursor: {
		imagePath: '/image/image.gif',
		width: 3,
		height: 3,
		scale: 5,
		flip: false,
		crop: { x: 5, y: 442, width: 6, height: 6 }
	}
});