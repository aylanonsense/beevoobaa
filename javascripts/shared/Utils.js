define({
	generateFakeLag: function(lag) {
		lag = lag || 100;
		var r = Math.random();
		if(r < 0.5) {
			return Math.floor(0.25 * lag + 0.05 * lag * Math.random());
		}
		else if(r < 0.8) {
			return Math.floor(0.20 * lag + 0.20 * lag * Math.random());
		}
		else if(r < 0.95) {
			return Math.floor(0.40 * lag + 0.50 * lag * Math.random());
		}
		else if(r < 0.98) {
			return Math.floor(1.20 * lag + 1.20 * lag * Math.random());
		}
		else {
			return Math.floor(1.50 * lag + 2.50 * lag * Math.random());
		}
	}
});