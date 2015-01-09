define(function() {
	var NEXT_ID = 0;
	function Zombie(params) {
		this.id = (typeof params.id === 'number' ? params.id : NEXT_ID++);
		this.x = (typeof params.x === 'number' ? params.x : 0);
		this.y = (typeof params.y === 'number' ? params.y : 0);
		this.moveDir = (typeof params.moveDir === 'string' ? params.moveDir : null);
		this._moveFramesLeft = 0;
	}
	Zombie.prototype.getState = function() {
		return {
			objectType: 'Zombie',
			id: this.id,
			x: this.x,
			y: this.y,
			moveDir: this.moveDir
		};
	};
	Zombie.prototype.tick = function(t) {
		//the zombie decides where it wants to go
		if(this._moveFramesLeft <= 0) {
			this._moveFramesLeft = 30 + Math.floor(120 * Math.random());
			var r = Math.random();
			if(r < 0.2) { this.moveDir = 'NORTH'; }
			else if(r < 0.4) { this.moveDir = 'SOUTH'; }
			else if(r < 0.6) { this.moveDir = 'EAST'; }
			else if(r < 0.8) { this.moveDir = 'WEST'; }
			else { this.moveDir = null; }
		}
		else {
			this._moveFramesLeft--;
		}

		//then it moves
		if(this.moveDir === 'NORTH') { this.y -= 10 * t; }
		else if(this.moveDir === 'SOUTH') { this.y += 10 * t; }
		else if(this.moveDir === 'EAST') { this.x += 10 * t; }
		else if(this.moveDir === 'WEST') { this.x -= 10 * t; }
	};
	return Zombie;
});