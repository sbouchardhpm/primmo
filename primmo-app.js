// App primmo
var config = require('./config'); // get our config file
var fs = require('fs');

var express 	= require('express');
var app         = express();

var https = require('https');
var http = require('http');
var httpServer = null;
var httpsServer = null;

if (config.secure == true) {
	var privateKey  = fs.readFileSync(config.keyFile, 'utf8');
	var certificate = fs.readFileSync(config.certFile, 'utf8');
	var credentials = {key: privateKey, cert: certificate};
	httpsServer = https.createServer(credentials, app);
	httpsServer.listen(config.port);
}
else {
	httpServer = http.createServer(app);
	httpServer.listen(config.port);
}



var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

//app.set('superSecret', config.secret); // secret variable

// =================================================================
// configuration ===================================================
// =================================================================
//var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
app.set("port",config.port);

mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));



// use morgan to log requests to the console
app.use(morgan('dev'));

//var server = app.listen(app.get("port"),function() {
//
//	console.log(server.address().port);
//	console.log("waiting you in " + app.get("port"));
//});



var routes = require("./api/routes");


app.use("/api",routes);

