define([
	'client/net/GameConnection',
	'client/Clock',
	'client/entity/EntityManager',
	'client/entity/Player',
	'client/entity/Ball',
	'client/Constants',
	'shared/Constants'
], function(
	GameConnection,
	Clock,
	EntityManager,
	Player,
	Ball,
	Constants,
	SharedConstants
) {
	var ENTITY_CLASSES = {
		'Player': Player,
		'Ball': Ball
	};

	//set up initial game state
	var playableEntity;
	function reset() {
		EntityManager.reset();
		playableEntity = null;
	}
	reset();

	//set up network handlers
	GameConnection.on('receive', function(msg) {
		var i;
		if(msg.messageType === 'spawn-entity') {
			EntityManager.spawnEntity(ENTITY_CLASSES[msg.type], msg.id, msg.state);
		}
		else if(msg.messageType === 'despawn-entity') {
			EntityManager.despawnEntityById(msg.id);
		}
		else if(msg.messageType === 'game-state') {
			entities = [];
			for(i = 0; i < msg.entities.length; i++) {
				EntityManager.spawnEntity(
					ENTITY_CLASSES[msg.entities[i].type],
					msg.entities[i].id,
					msg.entities[i].state
				);
			}
			playableEntity = EntityManager.getEntityById(msg.playableEntityId);
			playableEntity.setPlayerControl(true);
		}
		else if(msg.messageType === 'game-state-update') {
			for(i = 0; i < msg.entities.length; i++) {
				EntityManager.getEntityById(msg.entities[i].id)
					.onStateUpdateFromServer(msg.entities[i].state);
			}
		}
		else if(msg.messageType === 'perform-action') {
			EntityManager.getEntityById(msg.id).onInputFromServer(msg.action);
		}
	});

	return {
		reset: reset,
		tick: function(t) {
			EntityManager.forEach(function(entity) {
				entity.startOfFrame(t);
			});
			EntityManager.forEach(function(entity) {
				entity.tick(t);
			});
			if(playableEntity) {
				EntityManager.forEach(function(entity) {
					if(entity.entityType === 'Ball') {
						playableEntity.checkForBallHit(entity);
					}
				});
			}
			EntityManager.forEach(function(entity) {
				entity.endOfFrame(t);
			});
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
			EntityManager.forEach(function(entity) {
				entity.render(ctx);
			});
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