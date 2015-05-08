define([
	'client/net/GameConnection',
	'shared/game/Simulation',
	'client/game/Clock',
	'client/game/EventGenerator',
	'client/config',
	'shared/config'
], function(
	GameConnection,
	Simulation,
	Clock,
	EventGenerator,
	config,
	sharedConfig
) {
	return function(simulation, ctx, renderMode) {
		var i;
		if(renderMode === 'background') {
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
		}
		else if(renderMode === 'silhouettes') {
			ctx.fillStyle = '#0f6';
			for(i = 0; i < simulation.entities.length; i++) {
				ctx.fillRect(simulation.entities[i].left, simulation.entities[i].top,
					simulation.entities[i].width, simulation.entities[i].height);
			}
		}
		else if(renderMode === 'outlines') {
			ctx.strokeStyle = '#0f6';
			ctx.lineWidth = 1;
			for(i = 0; i < simulation.entities.length; i++) {
				ctx.strokeRect(simulation.entities[i].left, simulation.entities[i].top,
					simulation.entities[i].width, simulation.entities[i].height);
			}
		}
		else {
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			for(i = 0; i < simulation.entities.length; i++) {
				ctx.fillStyle = '#f00';
				if(simulation.entities[i].entityType === 'Player') {
					if(simulation.entities[i].task === 'charging-swing') {
						ctx.fillStyle = '#f08';
					}
					else if(simulation.entities[i].task === 'swinging') {
						ctx.fillStyle = '#f0f'
					}
				}
				ctx.fillRect(simulation.entities[i].left, simulation.entities[i].top,
					simulation.entities[i].width, simulation.entities[i].height);
				if(simulation.entities[i].entityType === 'Player') {
					if(simulation.entities[i].isAiming()) {
						ctx.beginPath();
						ctx.moveTo(simulation.entities[i].centerX, simulation.entities[i].centerY);
						ctx.lineTo(simulation.entities[i].centerX + simulation.entities[i].aim * 100,
							simulation.entities[i].centerY - 50 - simulation.entities[i].charge * 100);
						ctx.stroke();
					}
				}
			}
		}
	};
});