//configure requirejs
var requirejs = require('requirejs');
requirejs.config({ baseUrl: __dirname + '/javascripts', nodeRequire: require });
require = requirejs;

//dependencies
var express = require('express');
var socketIO = require('socket.io');
var ConnectionServer = require('server/net/Server');

//set up node server
var app = express();
app.use(express.static(__dirname + '/public'));
app.use('/client', express.static(__dirname + '/javascripts/client'));
app.use('/shared', express.static(__dirname + '/javascripts/shared'));
var server = app.listen(process.env.PORT || 3000);
var socketServer = socketIO(server);
socketServer.on('connection', ConnectionServer.handleSocket);

//start server
require('server/Main')();