define(function() {
	var entities = [];

	return {
		reset: function() {
			entities = [];
		},
		getEntityById: function(id) {
			for(var i = 0; i < entities.length; i++) {
				if(entities[i].id === id) {
					return entities[i];
				}
			}
			return null;
		},
		spawnEntity: function(EntityClass, id, state) {
			var entity = new EntityClass(id, state);
			entities.push(entity);
			return entity;
		},
		despawnEntityById: function(id) {
			entities = entities.filter(function(entity) {
				return entity.id !== id;
			});
		},
		forEach: function(callback) {
			entities.forEach(callback);
		},
		map: function(callback) {
			entities.map(callback);
		}
	};
});