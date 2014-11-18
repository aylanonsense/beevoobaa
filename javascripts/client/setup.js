//configure requirejs
requirejs.config({ baseUrl: '/', paths: { jquery: '/client/lib/jquery' } });

//start client
requirejs([ 'client/Main' ], function(ClientMain) {
	ClientMain();
});