//configure requirejs
requirejs.config({ baseUrl: '/' });

//start client
requirejs([ 'client/Main' ], function(ClientMain) {
	ClientMain();
});