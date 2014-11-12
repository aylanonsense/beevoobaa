if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'game/config/sprite-config',
	'game/display/SpriteSheet'
], function(
	config,
	SpriteSheet
) {
	var SPRITESHEETS = {};
	var IMAGES = {};

	//spritesheets will be memoized so it's fine to call loadSpreadSheet twice with the same key
	function loadSpriteSheet(key) {
		if(!config[key]) {
			throw new Error("There does not exist a spritesheet with an id of '" + key + "'");
		}
		//create the spritesheet if it doesn't already exist
		if(!SPRITESHEETS[key]) {
			SPRITESHEETS[key] = new SpriteSheet(config[key], key);
			//if the image isn't loaded... well, we need to load it
			var imagePath = config[key].imagePath;
			if(!IMAGES[imagePath]) {
				var image = new Image();
				IMAGES[imagePath] = {
					imageData: null,
					width: null,
					height: null,
					waitingOnLoad: [ SPRITESHEETS[key] ]
				};
				//when it's done loading, give the image data to everything waiting on it
				image.onload = function() {
					//copy the image onto a canvas to get image data out of it
					var canvas = document.createElement('canvas');
					canvas.width = image.width;
					canvas.height = image.height;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(image, 0, 0);
					IMAGES[imagePath].imageData = ctx.getImageData(0, 0, image.width, image.height).data;
					IMAGES[imagePath].width = image.width;
					IMAGES[imagePath].height = image.height;
					//inform every spritesheet that relies on this image that it is loaded
					for(var i = 0; i < IMAGES[imagePath].waitingOnLoad.length; i++) {
						IMAGES[imagePath].waitingOnLoad[i].onImageLoaded(IMAGES[imagePath].imageData,
								IMAGES[imagePath].width, IMAGES[imagePath].height);
					}
					delete IMAGES[imagePath].waitingOnLoad;
				};
				image.src = imagePath;
			}
			//if it's loading, add this spritesheet to the list of things to be notified when it's loaded
			else if(!IMAGES[imagePath].imageData) {
				IMAGES[imagePath].waitingOnLoad.push(SPRITESHEETS[key]);
			}
			//if it's done loading, great, now we can manipulate it according to the sprite
			else {
				SPRITESHEETS[key].onImageLoaded(IMAGES[imagePath].imageData, IMAGES[imagePath].width, IMAGES[imagePath].height);
			}
		}
		return SPRITESHEETS[key];
	}

	//SpriteLoader is a singleton
	return {
		loadSpriteSheet: loadSpriteSheet
	};
});