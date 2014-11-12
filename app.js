//configure requirejs
var requirejs = require('requirejs');
requirejs.config({ baseUrl: __dirname + '/javascripts', nodeRequire: require });
require = requirejs;

//dependencies
var express = require('express');
var lessMiddleware = require('less-middleware');

//set up node server
var app = express();
app.use(lessMiddleware({ src: __dirname + "/public", compress: true }));
app.use(express.static(__dirname + '/public'));
app.use('/client', express.static(__dirname + '/javascripts/client'));
app.use('/shared', express.static(__dirname + '/javascripts/shared'));
app.listen(3000);

//start server
require('server/Main')();