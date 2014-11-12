//configure requirejs
requirejs.config({ baseUrl: '/' });

//run ClientMain.js
requirejs([ 'client/ClientMain' ], function(ClientMain) {
	ClientMain();
});