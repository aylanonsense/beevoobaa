define([
	'client/config',
	'shared/utils/EventHelper'
], function(
	config,
	EventHelper
) {
	var events = new EventHelper([ 'key-event' ]);
	var keyboard = {};
	for(var key in config.KEY_BINDINGS) {
		keyboard[config.KEY_BINDINGS[key]] = false;
	}

	//add keyboard handler
	function onKeyboardEvent(evt) {
		var isDown = (evt.type === 'keydown');
		if(config.KEY_BINDINGS[evt.which]) {
			evt.preventDefault();
			if(keyboard[config.KEY_BINDINGS[evt.which]] !== isDown) {
				keyboard[config.KEY_BINDINGS[evt.which]] = isDown;
				events.trigger('key-event', config.KEY_BINDINGS[evt.which], isDown, keyboard);
			}
		}
	}
	document.onkeyup = onKeyboardEvent;
	document.onkeydown = onKeyboardEvent;

	return {
		on: function(eventName, callback) {
			events.on(eventName, callback);
		}
	};
});