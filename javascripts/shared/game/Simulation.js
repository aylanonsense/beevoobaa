define([
	'shared/entity/Player',
	'shared/entity/Ball'
], function(
	Player,
	Ball
) {
	function Simulation() {
		this.entities = [];
	}
	Simulation.prototype.reset = function() {
		this.entities = [];
	};
	Simulation.prototype.getState = function() {
		return {
			entities: this.entities.map(function(entity) {
				return { type: entity.entityType, state: entity.getState() };
			})
		};
	};
	Simulation.prototype.setState = function(state) {
		var self = this;
		this.entities = [];
		state.entities.forEach(function(entity) {
			self._spawnEntity(entity.type, entity.state);
		});
	};
	Simulation.prototype.applyEvent = function(evt) {
		if(evt.type === 'spawn-player') {
			this._spawnPlayer(evt.id, evt.x);
		}
		else if(evt.type === 'spawn-ball') {
			this._spawnBall(evt.id, evt.x, evt.y, evt.velX, evt.velY);
		}
		else if(evt.type === 'despawn-entity') {
			this._despawnEntityById(evt.entityId);
		}
		else if(evt.type === 'perform-entity-action') {
			this._performEntityAction(evt.entityId, evt.action);
		}
		else {
			throw new Error("Unknown event of type '" + evt.type + "'");
		}
	};
	Simulation.prototype._spawnPlayer = function(id, x) {
		var player = new Player();
		player.entityId = id;
		player.teleportTo(x);
		this.entities.push(player);
	};
	Simulation.prototype._spawnBall = function(id, x, y, velX, velY) {
		var ball = new Ball();
		ball.entityId = id;
		ball.teleportTo(x, y);
		ball.setVelocity(velX, velY);
		this.entities.push(ball);
	};
	Simulation.prototype._despawnEntityById = function(id) {
		this.entities = this.entities.filter(function(entity) {
			return entity.entityId !== id;
		});
	};
	Simulation.prototype._spawnEntity = function(type, state) {
		if(type === 'Player') {
			this.entities.push(new Player(state));
		}
		else if(type === 'Ball') {
			this.entities.push(new Ball(state));
		}
		else {
			throw new Error("Unknown entity of type '" + type + "'");
		}
	};
	Simulation.prototype._performEntityAction = function(id, action) {
		this.getEntityById(id).performAction(action);
	};
	Simulation.prototype.getEntityById = function(id) {
		for(var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].entityId === id) {
				return this.entities[i];
			}
		}
	};
	Simulation.prototype.tick = function(t) {
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].startOfFrame(t);
		}
		for(i = 0; i < this.entities.length; i++) {
			this.entities[i].tick(t);
		}
		for(i = 0; i < this.entities.length; i++) {
			this.entities[i].endOfFrame(t);
		}
	};
	return Simulation;
});