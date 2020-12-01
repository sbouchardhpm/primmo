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

var disableClient = function(req,res) {
	
	var noClient = req.params.noClient;
	
	User.findOne({"name": noClient}, function(err, aUser) {
		
			if (err) {
				
				console.log("Error looking for user " + noClient);
				console.log(err);
				
				res.status(500)
				.json(err);
				return;
			}
			
			if (! aUser) {
				
				res.status(404)
				.send("Client " + noClient + " introuvable");
				return;
			}
			
			aUser.name = aUser.name + " - DISABLED";
			aUser.password = (Math.floor(Math.random() * 10000000) + 1).toString();
			
			aUser.save(function(err2,doc) {
				
				if (err2) {
					console.log("Error saving user " + noClient);
					console.log(err);
					
					res.status(500)
					.json(err);
					return;
				}
				
				User.find({'clients.noClient' : {$eq : noClient}},function(err3,docs) {
					
					
					for (var i=0; i < docs.length; i++) {
						var user = docs[i];
						for (var j=0; j < user.clients.length; j++) {
							var client = user.clients[j];
							if (client.noClient == noClient) {
								client.noClient = client.noClient + " - DISABLED";
								client.lastPushedDate = "";
								user.save(function(err,updatedUser) {
								if (err)
									console.log("erreur de mise a jour user") ;
								});
								break;
								
							
							}
						}
					}
				});
				
				Client.deleteOne({"noClient" : noClient} , function(err4) {
					
					if (err4) {
						console.log("Error while deleting client " + noClient);
						console.log(err4);
						
						res.status(500)
						.send("Error while deleting client " + noClient);
						return;
					}
					
					res.status(200)
					.send("Client " + noClient + " disabled");
				});
			});
		
	});
	
};

module.exports = {
	setup : setupEnv,
	auth: 	auth,
	getClients : getClients,
	listInactive : listInactive,
	disableClient : disableClient
};