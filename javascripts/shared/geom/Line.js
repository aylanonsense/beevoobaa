define(function() {
	function Line(x1, y1, x2, y2) {
		this._geomType = 'line';
		this._start = { x: x1, y: y1 };
		this._end = { x: x2, y: y2 };

		//we pre-calculate a lot of data to make it easier to detect intersections
		var dx = x2 - x1;
		var dy = y2 - y1;
		var squareDist = dx * dx + dy * dy;
		//line segments with a length of zero (or close to it) are a special case that is easy to handle
		this._isSinglePoint = (dx === 0 && dy === 0) || squareDist < 0.00001;
		if(!this._isSinglePoint) {
			//vertical lines can't be defined in terms of y=mx+b, so we we do x=my+b instead
			if(dx === 0) {
				this._useReciprocalSlope = true;
				this._reciprocalSlope = 0;
				this._xIntercept = start.x;
			}
			//we choose to set the y intercept manually with horizontal lines for clarity
			else if(dy === 0) {
				this._useReciprocalSlope = false;
				this._slope = 0;
				this._yIntercept = start.y;
			}
			else {
				//for slopes between -1 and 1 (horizontal-ish lines) we use traditional y=mx+b
				if(-dx < dy && dy < dx) {
					this._useReciprocalSlope = false;
					this._slope = dy / dx;
					this._yIntercept = start.y - this._slope * start.x;
				}
				//for slopes less than -1 or greater than 1, we use x=my+b to avoid rounding problems
				else {
					this._useReciprocalSlope = true;
					this._reciprocalSlope = dx / dy;
					this._xIntercept = start.x - this._reciprocalSlope * start.y;
				}
			}
		}
	}
	Line.prototype.getYAt = function(x) {
		if((this._start.x <= x && x <= this._end.x) ||
			(this._start.x >= x && x >= this._end.x)) {
			if(this._isSinglePoint) {
				return this._start.y;
			}
			else if(this._useReciprocalSlope) {
				return (x - this._xIntercept) / this._reciprocalSlope;
			}
			else {
				return this._slope * x + this._yIntercept;
			}
		}
		return null;
	};
	Line.prototype.getXAt = function(y) {
		if((this._start.y <= y && y <= this._end.y) ||
			(this._start.y >= y && y >= this._end.y)) {
			if(this._isSinglePoint) {
				return this._start.x;
			}
			else if(this._useReciprocalSlope) {
				return this._reciprocalSlope * y + this._xIntercept;
			}
			else {
				return (y - this._yIntercept) / this._slope;
			}
		}
		return null;
	};
	Line.prototype.isOverlapping = function(geom) {
		if(!geom) {
			return false;
		}
		else if(geom._geomType === 'line') {
			throw new Error("I didn't program line-to-line overlaps yet!");
		}
		else if(geom._geomType === 'rect') {
			return geom.isOverlappying(this);
		}
		else {
			throw new Error("Unsure how to test whether line is crossing '" + geom._geomType + "'");
		}
	};
	Line.prototype.render = function(ctx, color, thickness) {
		ctx.strokeStyle = color || '#f0f';
		ctx.lineWidth = thickness || 1.5;
		ctx.beginPath();
		ctx.moveTo(this._start.x, this._start.y);
		ctx.lineTo(this._end.x, this._end.y);
		ctx.stroke();
	};

	//define useful properties
	Object.defineProperty(Line.prototype, 'start', {
		get: function() { return { x: this._start.x, y: this._start.y }; },
		set: function() { throw new Error("Unable to modify start point of line"); }
	});
	Object.defineProperty(Line.prototype, 'end', {
		get: function() { return { x: this._end.x, y: this._end.y }; },
		set: function() { throw new Error("Unable to modify end point of line"); }
	});

	return Line;
});