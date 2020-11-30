var User   = require('../data/user.js'); // get our mongoose model
var Client   = require('../data/structure.js'); 
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../../configApi'); // get our config file
var Utils = require("../utils/utils.js");


var setupEnv = function(req,res) {
	
	
	User.findOne({"name" : "adminPrimmo" }, function(err, aUser) {
	
				
		if (err) {
			console.log( err);
			res.status(500)
			.json(err);
		}
		else if (aUser != null) {
			console.log("Application already setup");
			res.status(200)
			.json({message : "Application already setup"});
		}
		else {
			// create a sample user
			var aUser = new User({ 
				name: 'adminPrimmo', 
				password: 'MasterOfTheUniverse',
				admin: true,
				clients : []
			});
			aUser.save(function(err) {
				if (err) {
					console.log( err);
					res.status(403)
					.json(err);
				}
				else {
					console.log('User saved successfully');
					res.status(200)
					.json({message : "Application setup OK"});
				}

				
			});
		}
	
	});
	
};

var auth = function(req,res) {
	
	var userId = req.body.user;
	var passwd = req.body.password;
	
	if (! userId || ! passwd) {
		res.status(403)
		.json({message : "Usager et/ou mot de passe manquant"});
	}
	else {
		User.findOne({name: userId}, function(err, user) {

			if (err) {
				console.log(err);
				res.status(500)
				.json(err);
			}
			else if (!user) {
				res
				.status(404)
				.json({  message: 'Authentification échec. Usager non trouvé' });
			} else if (user) {

				// check if password matches
				if (user.password != passwd) {
					res.status(403)
					.json({ message: 'Authentification échec. Mot de passe incorect' });
				} else {

					// if user is found and password is right
					// create a token
					var toSign = {
						name : user.name,
						admin : user.admin,
						clients : user.clients,
						rights : (user.rights == undefined ? "" : user.rights )
					};
					
					
					
					
					
					var token = jwt.sign(toSign, config.secret, {
						expiresIn : '24h' 
					});
					

					res.status(200)
					.json({
						
						token: token
					});
				}		
			}

		});
	}
	
}

var getClients = function(req,res) {
	
	var userId = req.uSess.name;
	
	User.findOne({name: userId}, 'name clients', function(err, user) {

	//console.log("user" + user);
			if (err) {
				console.log(err);
				res.status(500)
				.json(err);
			}
			else if (!user) {
				res
				.status(404)
				.json({  message: 'Authentification échec. Usager non trouvé' });
			} else if (user) {
				
				var aUser = Utils._removeDBToken(user.toObject());
				
				
				res.status(200)
					.json(aUser);
			}

		});
	
};

var listInactive = function(req,res) {
	
	var aDate = new Date();
	aDate.setDate(aDate.getDate() -1);
	
	var theDate = aDate.toISOString();
	theDate = theDate.replace("T", " ");
	theDate = theDate.substring(0,19);
	
	console.log("theDate = " + theDate);
	Client.find( {"lastPushedDate" : {$lt : theDate}}, {"noClient" : 1, "lastPushedDate" : 1}, function (err, clients) {
		
		if (err) {
			
			console.log("Error in list inactive");
			console.log(err);
			
			res.status(500)
			.json(err);
			return;
		}
		
		var result = "";
		for (var i=0; i < clients.length ; i++)
			result = result + ((i !=0) ? "<BR/>" : "") + clients[i].lastPushedDate + " - " + clients[i].noClient;
		
		if (result == "")
			result = "No inactive client";
		
		res.status(200)
		.send(result);
		
		
	});
};

module.exports = {
	setup : setupEnv,
	auth: 	auth,
	getClients : getClients,
	listInactive : listInactive
};