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
		if(this.moveDir === 'NORTH') { this.y -= 150 * t; }
		else if(this.moveDir === 'SOUTH') { this.y += 150 * t; }
		else if(this.moveDir === 'EAST') { this.x += 150 * t; }
		else if(this.moveDir === 'WEST') { this.x -= 150 * t; }
		if(this.x < 100) { this.x = 100; }
		else if(this.x > 700) { this.x = 700; }
		if(this.y < 100) { this.y = 100; }
		else if(this.y > 500) { this.y = 500; }
	};
	Zombie.prototype.render = function(ctx) {
		ctx.fillStyle = '#3a3';
		ctx.fillRect(this.x, this.y, 40, 40);
		ctx.fillStyle = '#fff';
		ctx.font = "20px Lucida Console";
		ctx.fillText((this.moveDir || '-')[0], this.x + 15, this.y + 26);
		ctx.font = "12px Lucida Console";
		ctx.fillText("" + this.id, this.x + 2, this.y + 12);
	};
	return Zombie;
});