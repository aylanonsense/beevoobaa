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
		var changedDirection = false;

		//the zombie decides where it wants to go
		if(this._moveFramesLeft <= 0) {
			this._moveFramesLeft = 30 + Math.floor(120 * Math.random());
			var r = Math.random();
			if(r < 0.25) { this.moveDir = 'NORTH'; }
			else if(r < 0.5) { this.moveDir = 'SOUTH'; }
			else if(r < 0.75) { this.moveDir = 'EAST'; }
			else { this.moveDir = 'WEST'; }
			changedDirection = true;
		}
		else {
			this._moveFramesLeft--;
		}

		//then it moves
		if(this.moveDir === 'NORTH') { this.y -= 75 * t; }
		else if(this.moveDir === 'SOUTH') { this.y += 75 * t; }
		else if(this.moveDir === 'EAST') { this.x += 75 * t; }
		else if(this.moveDir === 'WEST') { this.x -= 75 * t; }
		if(this.x < 100) { this.x = 100; }
		else if(this.x > 700) { this.x = 700; }
		if(this.y < 100) { this.y = 100; }
		else if(this.y > 500) { this.y = 500; }

		if(changedDirection) {
			return this.getState();
		}
	};
	return Zombie;
});