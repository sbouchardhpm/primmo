// App primmo

var appSecure = null; 
var appNonSecure = null; 

var fs = require('fs');

var express 	= require('express');
var proxy = require('express-http-proxy');


var https = require('https');
var http = require('http');

var httpServer = null;
var httpsServe = null;


var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

doSetupServer();

doSetupApi();

doSetupFs();

doSetupWiki();

function doSetupServer() {
	
	var configServer = require('./configServer'); // get our config file
	
	appSecure = express();
	
	var privateKey  = fs.readFileSync(configServer.keyFile, 'utf8');
	var certificate = fs.readFileSync(configServer.certFile, 'utf8');
	var credentials = {key: privateKey, cert: certificate};
	httpsServer = https.createServer(credentials, appSecure);
	httpsServer.listen(configServer.securePort);
	httpsServer.timeout = 600000;
	appSecure.set("port",configServer.securePort);
	// use morgan to log requests to the console
	appSecure.use(morgan('common'));
	
	appNonSecure = express();
	
	httpServer = http.createServer(appNonSecure);
	httpServer.listen(configServer.nonSecurePort);
	httpServer.timeout = 600000;
	appNonSecure.set("port",configServer.nonSecurePort);
	
}

function doSetupFs() {
	
	var configFs = require('./configFs'); // get our config file
	
	var routesFs = require("./fs/routes");

	if (configFs.secure == true)
		appSecure.use("/fs",routesFs);
	else
		appNonSecure.use("/fs",routesFs);
}



function doSetupApi() {
	
	var configApi = require('./configApi'); // get our config file
	
	mongoose.connect(configApi.database); // connect to database
	
	// use body parser so we can get info from POST and/or URL parameters
	
		
	var routesApi = require("./api/routes");
	var routesRestrict = require("./restrict");

	if (configApi.secure == true) {
		appSecure.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
		appSecure.use(bodyParser.json({limit: '50mb'}));
		if (configApi.restrictMode) {
			appSecure.use("/restrict",routesRestrict);
		}
		else {
			appSecure.use("/api",routesApi);
		}
	}
	else {
		appNonSecure.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
		appNonSecure.use(bodyParser.json({limit: '50mb'}));
		if (configApi.restrictMode) {
			appNonSecure.use("/restrict",routesRestrict);
		}
		else {
			appNonSecure.use("/api",routesApi);
		}
	}
	
	console.log("timeout = " + httpServer.timeout);

}

function doSetupWiki() {
	
	var configWiki = require('./configWiki'); // get our config file
	appNonSecure.use(configWiki.basePath, proxy(configWiki.redirectUrl,{
		proxyReqPathResolver: function(req) {
			//console.log('url=' + req.url )
			return configWiki.redirectPath +  req.url;
		}
	}));
	
}
