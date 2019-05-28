var User   = require('../data/user.js'); // get our mongoose model
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
						clients : user.clients
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

module.exports = {
	setup : setupEnv,
	auth: 	auth,
	getClients : getClients
};