//configure requirejs
var requirejs = require('requirejs');
requirejs.config({ baseUrl: __dirname + '/javascripts', nodeRequire: require });
require = requirejs;

//dependencies
var express = require('express');
var lessMiddleware = require('less-middleware');
var http = require('http');
var socketIO = require('socket.io');

//set up node server
var app = express();
var server = http.Server(app);
var socketServer = socketIO(server);
app.use(lessMiddleware({ src: __dirname + "/public", compress: true }));
app.use(express.static(__dirname + '/public'));
app.use('/client', express.static(__dirname + '/javascripts/client'));
app.use('/shared', express.static(__dirname + '/javascripts/shared'));
var Connection = require('server/net/Connection');
Connection.setSocketServer(socketServer);
socketServer.on('connection', function(socket){
	Connection.handleSocket(socket);
	/*console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('hello', function(place, punctuation){
		console.log('hello', place, punctuation);
	});*/
});
server.listen(3000);

//start server
require('server/Main')();