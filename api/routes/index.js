var express = require("express");
var router = express.Router();
var config = require("../../config.js");
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

var adminCtrl = require("../controllers/admin.js");
var structureCtrl = require("../controllers/structure.js");

var _gotoWelcome = function(req,res) {
	
	res.sendFile( __dirname + "/public/index.html");
};

router
	.route("/")
	.get(_gotoWelcome)
	.post(_gotoWelcome);
	
router
	.route("/admin/setup")
	.get(adminCtrl.setup);
	
router
	.route("/authenticate")
	.post(adminCtrl.auth);
	
router.use(function(req, res, next) {
	
	// save ip address of request
	var ip = req.ip;
	var pos = ip.lastIndexOf(":");
	if (pos > 0)
		req.usedIp = ip.substring(pos+1);
	else
		req.usedIp = ip;
	
	//console.log("ip=" + req.usedIp);
	
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	
	if (config.debug) {
		for (prop in req.body) {
			console.log(prop + " = " + req.body[prop] );
		}
	}
	
	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, config.secret, function(err, decoded) {	
	
			if (err) {
				res
				.status(403)
				.json({  message: 'Echec autentification du token' });	
				return;
			} else {
				// if everything is good, save to request for use in other routes
								
				req.uSess = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).json({ 
			
			message: 'Aucun token fourni'
		});
		
	}
	
});

router
	.route("/structure/:noClient/push")
	.post(structureCtrl.push);

router
	.route("/structure/:noClient/get")
	.post(structureCtrl.exp)
	.get(structureCtrl.exp);
	
router
	.route("/clients")
	.post(adminCtrl.getClients);
	
module.exports = router;

