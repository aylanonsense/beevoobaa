define({
	generateFakeLag: function(lag) {
		lag = (lag || 100) / 2.1;
		var r = Math.random();
		if(r < 0.85) {
			return Math.floor(0.98 * lag + 0.02 * lag * Math.random());
		}
		else if(r < 0.93) {
			return Math.floor(1.00 * lag + 0.50 * lag * Math.random());
		}
		else {
			return Math.floor(3.00 * lag + 2.00 * lag * Math.random());
		}
	}
});