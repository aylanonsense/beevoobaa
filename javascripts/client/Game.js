define([
	'client/net/GameConnection',
	'client/Clock',
	'client/entity/Player',
	'client/entity/Ball',
	'client/Constants',
	'shared/Constants'
], function(
	GameConnection,
	Clock,
	Player,
	Ball,
	Constants,
	SharedConstants
) {
	var camera, entities, playableEntity;
	function reset() {
		//render vars
		camera = { x: 0, y: 0 };

		//entities
		entities = [];
		playableEntity = null;
	}
	reset();

	//entity methods
	function getEntityById(id) {
		for(var i = 0; i < entities.length; i++) {
			if(entities[i].id === id) {
				return entities[i];
			}
		}
		return null;
	}
	function spawnEntity(type, id, state) {
		var entity = null;
		if(type === 'Player') {
			entity = new Player(id, state);
			entities.push(entity);
		}
		else if(type === 'Ball') {
			entity = new Ball(id, state);
			entities.push(entity);
		}
		return entity;
	}
	function despawnEntityById(id) {
		entities = entities.filter(function(entity) {
			return entity.id !== id;
		});
	}

	//set up network handlers
	GameConnection.on('receive', function(msg) {
		var i;
		if(msg.messageType === 'spawn-entity') {
			spawnEntity(msg.type, msg.id, msg.state);
		}
		else if(msg.messageType === 'despawn-entity') {
			despawnEntityById(msg.id);
		}
		else if(msg.messageType === 'game-state') {
			entities = [];
			for(i = 0; i < msg.entities.length; i++) {
				spawnEntity(msg.entities[i].type, msg.entities[i].id, msg.entities[i].state);
			}
			playableEntity = getEntityById(msg.playableEntityId);
			playableEntity.setPlayerControl(true);
		}
		else if(msg.messageType === 'game-state-update') {
			for(i = 0; i < msg.entities.length; i++) {
				getEntityById(msg.entities[i].id).onStateUpdateFromServer(msg.entities[i].state);
			}
		}
		else if(msg.messageType === 'perform-action') {
			getEntityById(msg.id).onInputFromServer(msg.action);
		}
	});

	return {
		reset: reset,
		tick: function(t) {
			for(var i = 0; i < entities.length; i++) {
				entities[i].startOfFrame(t);
			}
			for(i = 0; i < entities.length; i++) {
				entities[i].tick(t);
			}
			for(i = 0; i < entities.length; i++) {
				entities[i].endOfFrame(t);
			}
		},
		render: function(ctx) {
			//clear canvas
			ctx.fillStyle = (Clock.speed === 1 ? '#fff' : (Clock.speed > 1 ? '#fee' : '#eef'));
			ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);

			//draw play area
			ctx.strokeStyle = '#666';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(SharedConstants.LEFT_BOUND, 0);
			ctx.lineTo(SharedConstants.LEFT_BOUND, SharedConstants.BOTTOM_BOUND);
			ctx.lineTo(SharedConstants.RIGHT_BOUND, SharedConstants.BOTTOM_BOUND);
			ctx.lineTo(SharedConstants.RIGHT_BOUND, 0);
			ctx.stroke();

			//render entities
			for(var i = 0; i < entities.length; i++) {
				entities[i].render(ctx);
			}
		},
		onMouseEvent: function(evt) {
			if(playableEntity) {
				playableEntity.onMouseEvent(evt);
			}
		},
		onKeyboardEvent: function(evt, keyboard) {
			if(playableEntity) {
				playableEntity.onKeyboardEvent(evt, keyboard);
			}
		}
	};
});