define({
	Athlete: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 4,
		flip: true,
		crop: { x: 5, y: 7, width: 144, height: 432 },
		trim: { x: 7, y: 6, width: 7, height: 16 }
	},
	AthleteOutline: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 4,
		flip: true,
		crop: { x: 5, y: 7, width: 144, height: 432 },
		trim: { x: 7, y: 6, width: 7, height: 16 },
		replacements: { '#c81f1f': '#0a5359', '#b2a119': '#0a5359', '#1dbaaf': '#0a5359',
						'#280fc4': '#0a5359', '#28a91c': '#0a5359', '#911bba': '#0a5359' }
	},
	Ball: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 4,
		flip: true,
		crop: { x: 101, y: 7, width: 24, height: 24 },
		trim: { x: 5, y: 5, width: 11, height: 11 }
	},
	BallShadow: {
		imagePath: '/image/image.gif',
		width: 24,
		height: 24,
		scale: 4,
		flip: true,
		crop: { x: 101, y: 7, width: 24, height: 24 },
		trim: { x: 5, y: 5, width: 11, height: 11 },
		replacements: { '#90ff00': '#0a5359', '#fffd00': '#0a5359', '#0096ff': '#0a5359',
						'#ff4200': '#0a5359', '#f9f9f9': '#0a5359', '#ff7200': '#0a5359' }
	},
	Cursor: {
		imagePath: '/image/image.gif',
		width: 3,
		height: 3,
		scale: 4,
		flip: false,
		crop: { x: 5, y: 442, width: 6, height: 6 }
	}
});