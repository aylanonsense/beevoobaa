define({
	generateFakeLag: function() {
		var r = Math.random();
		if(r < 0.5) {
			return Math.floor(25 + 5 * Math.random());
		}
		else if(r < 0.8) {
			return Math.floor(20 + 20 * Math.random());
		}
		else if(r < 0.95) {
			return Math.floor(40 + 50 * Math.random());
		}
		else {
			return Math.floor(120 + 120 * Math.random());
		}
	}
});