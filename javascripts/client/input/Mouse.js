define([
	'client/global/canvas',
	'shared/utils/EventHelper'
], function(
	canvas,
	EventHelper
) {
	var events = new EventHelper([ 'mouse-event' ]);

	//add mouse handler
	function onMouseEvent(evt) {
		events.trigger('mouse-event',
			evt.clientX - canvas.offsetLeft + document.body.scrollLeft,
			evt.clientY - canvas.offsetTop + document.body.scrollTop,
			evt.type);
	}
	canvas.onmousedown = onMouseEvent;
	document.onmouseup = onMouseEvent;
	document.onmousemove = onMouseEvent;

	return {
		on: function(eventName, callback) {
			events.on(eventName, callback);
		}
	};
});