define(function() {
	var spawnEffectCallbacks = [];

	function onEffectSpawned(callback) {
		spawnEffectCallbacks.push(callback);
	}

	function spawnEffect(effect) {
		for(var i = 0; i < spawnEffectCallbacks.length; i++) {
			spawnEffectCallbacks[i](effect);
		}
		return effect;
	}

	return {
		onEffectSpawned: onEffectSpawned,
		spawnEffect: spawnEffect
	};
});