var express = require("express");
var routerFs = express.Router();
var configFs = require("../../configFs.js");



var _gotoWelcome = function(req,res) {
	
	res.sendFile( __dirname + "/public/index.html");
};

routerFs
	.route("/*")
	.get(_serveFile)
	.post(_serveFile);
	


function _serveFile(req,res) {
	
	if (configFs.debug == true)
		console.log("url="+ req.path);
	
	res.sendFile( configFs.repository + req.path,function(err) {
		if (err) {
			 res.status(404).send(req.path + " n'existe pas");
		}
	});
}



	
module.exports = routerFs;

