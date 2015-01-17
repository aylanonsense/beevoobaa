define(function() {
	function Human(params) {
		this.id = params.id;
		this.x = params.x;
		this.y = params.y;
		this.moveDir = params.moveDir;
	}
	Human.prototype.receiveUpdate = function(update) {
		this.x = update.x;
		this.y = update.y;
		this.moveDir = update.moveDir;
	};
	Human.prototype.tick = function(t) {
		if(this.moveDir === 'NORTH') { this.y -= 150 * t; }
		else if(this.moveDir === 'SOUTH') { this.y += 150 * t; }
		else if(this.moveDir === 'EAST') { this.x += 150 * t; }
		else if(this.moveDir === 'WEST') { this.x -= 150 * t; }
		if(this.x < 100) { this.x = 100; }
		else if(this.x > 700) { this.x = 700; }
		if(this.y < 100) { this.y = 100; }
		else if(this.y > 500) { this.y = 500; }
	};
	Human.prototype.render = function(ctx) {
		ctx.fillStyle = '#a33';
		ctx.fillRect(this.x, this.y, 40, 40);
		ctx.fillStyle = '#fff';
		ctx.font = "12px Lucida Console";
		ctx.fillText("" + this.id, this.x + 2, this.y + 12);
	};
	return Human;
});