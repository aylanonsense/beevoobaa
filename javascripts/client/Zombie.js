define(function() {
	function Zombie(params) {
		this.id = params.id;
		this.x = params.x;
		this.y = params.y;
		this.moveDir = params.moveDir;
	}
	Zombie.prototype.receiveUpdate = function(update) {
		this.x = update.x;
		this.y = update.y;
		this.moveDir = update.moveDir;
	};
	Zombie.prototype.tick = function(t) {
		if(this.moveDir === 'NORTH') { this.y -= 10 * t; }
		else if(this.moveDir === 'SOUTH') { this.y += 10 * t; }
		else if(this.moveDir === 'EAST') { this.x += 10 * t; }
		else if(this.moveDir === 'WEST') { this.x -= 10 * t; }
	};
	Zombie.prototype.render = function(ctx) {
		ctx.fillStyle = '#3a3';
		ctx.fillRect(this.x, this.y, 40, 40);
	};
	return Zombie;
});