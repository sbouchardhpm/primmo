var Client = (require("../data/structure.js")).clientModel;
var Compagnie = (require("../data/structure.js")).compagnieModel;
var Utils = require("../utils/utils.js");
var User = require("../data/user.js");

var pushClient = function(req,res) {
	
	var noClient = req.params.noClient;
	var uSess = req.uSess;
	if (validateSession(uSess,noClient,false) == false) {
		res.status(403)
		.json({message: "Client invalide ou accès refusé"});
		return;
	}
	
	if (validateRights(uSess,"push") == false) {
		res.status(403)
		.json({message: "Accès refusé"});
		return;
	}
	
	var data = req.body.data;
	
	if (! data) {
		res.status(403)
		.json({message: "Données client manquantes"});
		return;
	}
	
	var obj = null;
	var offset = (new Date()).getTimezoneOffset() * 60000;
	var aDate = (new Date(Date.now() - offset)).toISOString();
	var aDate = aDate.substring(0,10) + " " + aDate.substring(11,19);
	
	try {
		obj = eval('(' + data + ')');
		obj.lastPushedDate = aDate;
		if (! obj.version) 
			obj.version = "1.0";
	}
	catch (err) {
		res.status(403)
		.json({message: "Données invalide : " + err});
		return;
	}
	
	var compagnies = obj.compagnies;
	
	delete obj.compagnies;
	
	
	
	
	//console.log("client="+clientId);
	var query = {'noClient': noClient};
	
	Client.findOneAndUpdate(query, obj, {upsert:true, overwrite : true}, function(err, doc){
		
		if (err) {
			console.log("Error on update client "  +noClient);
			console.log("Error message : " + err);
			res.status(500)
			.json({message: "Erreur : " + err});
			return;
		}
		
		
		
		
		
		
		var token = {"trigger" : false, "done" : false, "error" : null, "noClient" : noClient, "version" : obj.version, "serialNo" : obj.serialNo};
		for (var i=0; i < compagnies.length ; i++) {
			
			var cmp = compagnies[i];
			//cmp.storageKey = noClient + '_' + cmp.id
			
			if (i == compagnies.length - 1)
				token.trigger = true;
			
			
			updateCompagnie(cmp, noClient, token)
			//query = {'storageKey' : cmp.storageKey };
			/*
			Compagnie.findOneAndUpdate(query, cmp, {upsert:true}, function(err, doc){
				
				
				
				if (err) {
					console.log("Error on update client "  +noClient);
					console.log("Error message : " + err);
					res.status(500)
					.json({message: "Erreur : " + err});
					return;
				}
				
				// Mise a jour de la date Push dans les usagers
				
				
				if (i == compagnies.length - 1) {
					
					User.find({'clients.noClient' : {$eq : noClient}},function(err,docs) {
						
						
						for (var i=0; i < docs.length; i++) {
							var user = docs[i];
							for (var j=0; j < user.clients.length; j++) {
								var client = user.clients[j];
								if (client.noClient == noClient) {
									client.lastPushedDate = aDate;
									client.version = obj.version;
									client.serialNo = obj.serialNo;
									client.ipAddress = req.usedIp;
									user.save(function(err,updatedUser) {
									if (err)
										console.log("erreur de mise a jour user") ;
									});
									break;
									
								
								}
							}
						}
					});
					
					res.status(200)
					.json({message: "Client sauvgardé"})
				}
				
				
				
			});*/
			
		}
		
		setTimeout(function(){
			completePush(token,res,req);
		},(compagnies.length * 100) + 5000);
		
		
	});
	
	
}

function completePush(token,response,request) {
	
	if (token.error != null) {
		console.log("Error on update client "  +noClient);
		console.log("Error message : " + token.error);
		response.status(500)
		.json({message: "Erreur : " + token.error});
		return;
	}
	
	if (token.done == true) {
		
		var offset = (new Date()).getTimezoneOffset() * 60000;
		var aDate = (new Date(Date.now() - offset)).toISOString();
		aDate = aDate.substring(0,10) + " " + aDate.substring(11,19);
		
		User.find({'clients.noClient' : {$eq : token.noClient}},function(err,docs) {
			
			
			for (var i=0; i < docs.length; i++) {
				var user = docs[i];
				for (var j=0; j < user.clients.length; j++) {
					var client = user.clients[j];
					if (client.noClient == token.noClient) {
						client.lastPushedDate = aDate;
						client.version = token.version;
						client.serialNo = token.serialNo;
						client.ipAddress = request.usedIp;
						user.save(function(err,updatedUser) {
						if (err)
							console.log("erreur de mise a jour user") ;
						});
						break;
						
					
					}
				}
			}
		});
		
		//console.log("update done");
		response.status(200)
		.json({message: "Client sauvegardé"})
		return;
	}
	
	setTimeout(function() {
		completePush(token,response,request);
	},2000);
	
}

function updateCompagnie(cie, noClient, token) {
	
	cie.storageKey = noClient + '_' + cie.id
	
	var query = {'storageKey' : cie.storageKey };
	
	Compagnie.findOneAndUpdate(query, cie, {upsert:true}, function(err, doc){
		//console.log("updated " + doc.storageKey);
		
		if (err) {
			token.error = err;
			return;
		}
		
		if (token.trigger == true)
			token.done = true;
	});
	
}


var exportClient = function(req,res) {
	
	var noClient = req.params.noClient;
	
	var uSess = req.uSess;
	if (validateSession(uSess,noClient,true) == false) {
		res.status(403)
		.json({message: "Client invalide ou accès refusé"});
		return;
	}
	
	if (validateRights(uSess,"get") == false) {
		res.status(403)
		.json({message: "Accès refusé"});
		return;
	}
	
	var projection = {
		_id : 0,
		__v : 0
		//Compagnies._id : 0
	}
	
	Client.findOne({"noClient" : noClient},function(err, doc) {
	
		if (err) {
			res.status(500)
			.json({message: "Erreur : " + err});
			return;
		}
		
		if (doc == null) {
			res.status(404)
			.json({message : "Aucune donnée pour client " + noClient})
			return;
		}
		else {
			
			var oneClient = doc.toObject();
			
			var regexp = new RegExp("^"+ noClient + "_");
			Compagnie.find({"storageKey" : regexp}, function(err,compagnies) {
				
				if (err) {
					res.status(500)
					.json({message: "Erreur : " + err});
					return;
				}
				
				var theCies = new Array();
				
				for (var i=0; i < compagnies.length; i++) {
					theCies[i] = compagnies[i].toObject();
					delete theCies[i].storageKey;
				}
					
				
				
				oneClient.compagnies = theCies;
				
				res.status(200)
				.json({data: Utils._removeDBToken(oneClient)})
				
			});
			
			
		}
		
	});
	
	
};


var listResident = function(req,res) {
	
	var noClient = req.params.noClient;
	
	var uSess = req.uSess;
	if (validateSession(uSess,noClient,true) == false) {
		res.status(403)
		.json({message: "Client invalide ou accès refusé"});
		return;
	}
	
	if (validateRights(uSess,"listResident") == false) {
		res.status(403)
		.json({message: "Accès refusé"});
		return;
	}
	
	var qry = Client.findOne({"noClient" : noClient});
	
	qry.select(projectionClientListResident);
	
	qry.exec(function(err, client) {
	
		if (err) {
			res.status(500)
			.json({message: "Erreur : " + err});
			return;
		}
		
		if (client == null) {
			res.status(404)
			.json({message : "Aucune donnée pour client " + noClient})
			return;
		}
		
		client = client.toObject()
		
		var regexp = new RegExp("^"+ noClient + "_");
		var qryCie = Compagnie.find({"storageKey" : regexp});
		
		qryCie.select(projectionCompagnieListResident);
		
		qryCie.exec( function(err,compagnies) {
			
			if (err) {
				res.status(500)
				.json({message: "Erreur : " + err});
				return;
			}
			
			var theCies = new Array();
			
			for (var i=0; i < compagnies.length; i++) {
				theCies[i] = compagnies[i].toObject();
				delete theCies[i].storageKey;
			}
				
			client.compagnies = theCies;
			
			res.status(200)
			.json({data: Utils._removeDBToken(client)})
		});
		
		
		
		
	});
	
	
};




var validateSession = function(session, noClient,get) {
	
	
	if (! noClient)
		return false;
		
	if (session.admin == true)
		return true;
		
	for (var i=0; i < session.clients.length ; i++) {
	
		if (noClient == session.clients[i].noClient ) {
			
			if (get == true && session.clients[i].lastPushedDate == "2001-01-01 10:00:00")
				return false;
			
			return true;
		} 
			
	}
	
	return false;
};


var validateRights = function(session,method) {
	
	if ( session.rights == undefined)
		return false;
	
	if (session.rights == "")
		return true;
	
	if (session.rights.indexOf(method) == -1)
		return false;
	
	return true;
}

module.exports = {
	push : pushClient,
	exp : exportClient,
	listResident : listResident 
};


var projectionClientListResident = {
		
		"noClient" : 1, 
		"nom": 1, 
		"lastPushedDate" : 1, 
		"version": 1
		
};

var projectionCompagnieListResident = {
		
		
		
		"id" : 1, 
		"nomCieDiv" : 1, 
		"noCie" : 1, 
		"noDiv" : 1, 
		
		"immeubles.id" : 1,
		"immeubles.immeuble" : 1,
		"immeubles.nom" : 1,
		"immeubles.adres1" : 1,
		"immeubles.adres2" : 1,
		"immeubles.adres3" : 1,
		"immeubles.codePost" : 1,
		"immeubles.zone" : 1,
		
		"immeubles.unites.id" : 1,
		"immeubles.unites.unite" : 1,
		"immeubles.unites.etage" : 1,
		
		"immeubles.unites.locataires.id" : 1,
		"immeubles.unites.locataires.prenom" : 1,
		"immeubles.unites.locataires.nomLoc" : 1,
		"immeubles.unites.locataires.cellulaire" : 1,
		"immeubles.unites.locataires.residence" : 1,
		"immeubles.unites.locataires.posteRes" : 1,
		"immeubles.unites.locataires.bureau" : 1,
		"immeubles.unites.locataires.poste" : 1,
		"immeubles.unites.locataires.email" : 1,
		"immeubles.unites.locataires.dateEnt" : 1,
		"immeubles.unites.locataires.dateExp" : 1,
		"immeubles.unites.locataires.dateDep" : 1,
		"immeubles.unites.locataires.sexe" : 1,
		"immeubles.unites.locataires.langue" : 1,
		"immeubles.unites.locataires.commPrivilege" : 1,
		"immeubles.unites.locataires.lha" : 1
		
};