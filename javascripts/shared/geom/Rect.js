define(function() {
	function Rect(x, y, width, height) {
		this._geomType = 'rect';
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	Rect.prototype.isOverlapping = function(geom) {
		if(!geom) {
			return false;
		}
		else if(geom._geomType === 'point') {
			return this._isOverlappingPoint(point);
		}
		else if(geom._geomType === 'rect') {
			return this._isOverlappingRect(geom);
		}
		else if(geom._geomType === 'line') {
			return this._isOverlappingLine(geom);
		}
		else {
			debugger;
			throw new Error("Unsure how to find overlap between rect and '" + geom._geomType + "'");
		}
	};
	Rect.prototype._isOverlappingPoint = function(point) {
		if(this.left <= point.x && point.x <= this.right &&
			this.top <= point.y && point.y <= this.bottom) {
			return true;
		}
	};
	Rect.prototype._isOverlappingRect = function(rect) {
		//two rects are intersecting if their horizontal and vertical "shadows" are both intersecting
		return ((rect.left <= this.left && rect.right > this.left) ||
			(this.left <= rect.left && this.right > rect.left)) &&
			((rect.top <= this.top && rect.bottom > this.top) ||
			(this.top <= rect.top && this.bottom > rect.top));
	};
	Rect.prototype._isOverlappingLine = function(line) {
		//a line can intersect a rect if the start point is inside of it
		if(this.left <= line.start.x && line.start.x <= this.right &&
			this.top <= line.start.y && line.start.y <= this.bottom) { return true; }

		//otherwise it can intersect the top, bottom, left, or right
		var xTop = line.getXAt(this.top);
		if(xTop !== null && this.left <= xTop && xTop <= this.right) { return true; }
		var xBottom = line.getXAt(this.bottom);
		if(xBottom !== null && this.left <= xBottom && xBottom <= this.right) { return true; }
		var yLeft = line.getXAt(this.left);
		if(yLeft !== null && this.top <= yLeft && yLeft <= this.bottom) { return true; }
		var yRight = line.getXAt(this.right);
		if(yRight !== null && this.top <= yRight && yRight <= this.bottom) { return true; }

		return false;
	};
	Rect.prototype.render = function(ctx, color, borderOnly, thickness) {
		if(borderOnly) {
			ctx.lineWidth = thickness || 1.5;
			ctx.strokeStyle = color || '#f0f';
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
		else {
			ctx.fillStyle = color || '#f0f';
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	};

	//define useful properties
	Object.defineProperty(Rect.prototype, 'left', {
		get: function() { return this.x; },
		set: function(x) { this.x = x; }
	});
	Object.defineProperty(Rect.prototype, 'right', {
		get: function() { return this.x + this.width; },
		set: function(x) { this.x = x - this.width; }
	});
	Object.defineProperty(Rect.prototype, 'top', {
		get: function() { return this.y; },
		set: function(y) { this.y = y; }
	});
	Object.defineProperty(Rect.prototype, 'bottom', {
		get: function() { return this.y + this.height; },
		set: function(y) { this.y = y - this.height; }
	});

	return Rect;
});