define(function() {
	var NEXT_ID = 100;
	function Human(params) {
		this.id = (typeof params.id === 'number' ? params.id : NEXT_ID++);
		this.x = (typeof params.x === 'number' ? params.x : 0);
		this.y = (typeof params.y === 'number' ? params.y : 0);
		this.moveDir = (typeof params.moveDir === 'string' ? params.moveDir : null);
		this._moveFramesLeft = 0;
	}
	Human.prototype.getState = function() {
		return {
			objectType: 'Human',
			id: this.id,
			x: this.x,
			y: this.y,
			moveDir: this.moveDir
		};
	};
	Human.prototype.changeDir = function(dir) {
		this.moveDir = dir;
	};
	Human.prototype.tick = function(t) {
		var changedDirection = false;

		//then it moves
		if(this.moveDir === 'NORTH') { this.y -= 150 * t; }
		else if(this.moveDir === 'SOUTH') { this.y += 150 * t; }
		else if(this.moveDir === 'EAST') { this.x += 150 * t; }
		else if(this.moveDir === 'WEST') { this.x -= 150 * t; }
		if(this.x < 100) { this.x = 100; }
		else if(this.x > 700) { this.x = 700; }
		if(this.y < 100) { this.y = 100; }
		else if(this.y > 500) { this.y = 500; }

		if(changedDirection) {
			return this.getState();
		}
	};
	return Human;
});