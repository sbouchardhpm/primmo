var Client = require("../data/structure.js");
var Utils = require("../utils/utils.js");
var User = require("../data/user.js");

var pushClient = function(req,res) {
	
	var noClient = req.params.noClient;
	var uSess = req.uSess;
	if (validateSession(uSess,noClient) == false) {
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
	
	//console.log("client="+clientId);
	var query = {'noClient': noClient};
	
	Client.findOneAndUpdate(query, obj, {upsert:true}, function(err, doc){
		
		if (err) {
			console.log("Error on update client "  +noClient);
			console.log("Error message : " + err);
			res.status(500)
			.json({message: "Erreur : " + err});
			return;
		}
		
		// Mise a jour de la date Push dans les usagers
		
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
	});
	
	
}


var exportClient = function(req,res) {
	
	var noClient = req.params.noClient;
	
	var uSess = req.uSess;
	if (validateSession(uSess,noClient) == false) {
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
			res.status(200)
			.json({data: Utils._removeDBToken(doc.toObject())})
		}
		
	});
	
	
};


var listResident = function(req,res) {
	
	var noClient = req.params.noClient;
	
	var uSess = req.uSess;
	if (validateSession(uSess,noClient) == false) {
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
	
	qry.select(projectionListResident);
	
	qry.exec(function(err, doc) {
	
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
			//console.log("res="+doc);
			res.status(200)
			.json({data: Utils._removeDBToken(doc.toObject())})
		}
		
	});
	
	
};




var validateSession = function(session, noClient) {
	
	
	if (! noClient)
		return false;
		
	if (session.admin == true)
		return true;
		
	for (var i=0; i < session.clients.length ; i++) {
	
		if (noClient == session.clients[i].noClient)
			return true;
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


var projectionListResident = {
		
		noClient : 1, 
		nom: 1, 
		lastPushedDate : 1, 
		version: 1, 
		
		"compagnies.id" : 1, 
		"compagnies.nomCieDiv" : 1, 
		"compagnies.noCie" : 1, 
		"compagnies.noDiv" : 1, 
		
		"compagnies.immeubles.id" : 1,
		"compagnies.immeubles.immeuble" : 1,
		"compagnies.immeubles.nom" : 1,
		"compagnies.immeubles.adres1" : 1,
		"compagnies.immeubles.adres2" : 1,
		"compagnies.immeubles.adres3" : 1,
		"compagnies.immeubles.codePost" : 1,
		"compagnies.immeubles.zone" : 1,
		
		"compagnies.immeubles.unites.id" : 1,
		"compagnies.immeubles.unites.unite" : 1,
		"compagnies.immeubles.unites.etage" : 1,
		
		"compagnies.immeubles.unites.locataires.id" : 1,
		"compagnies.immeubles.unites.locataires.prenom" : 1,
		"compagnies.immeubles.unites.locataires.nomLoc" : 1,
		"compagnies.immeubles.unites.locataires.cellulaire" : 1,
		"compagnies.immeubles.unites.locataires.residence" : 1,
		"compagnies.immeubles.unites.locataires.posteRes" : 1,
		"compagnies.immeubles.unites.locataires.bureau" : 1,
		"compagnies.immeubles.unites.locataires.poste" : 1,
		"compagnies.immeubles.unites.locataires.email" : 1,
		"compagnies.immeubles.unites.locataires.dateEnt" : 1,
		"compagnies.immeubles.unites.locataires.dateExp" : 1,
		"compagnies.immeubles.unites.locataires.dateDep" : 1,
		"compagnies.immeubles.unites.locataires.sexe" : 1,
		"compagnies.immeubles.unites.locataires.langue" : 1,
		"compagnies.immeubles.unites.locataires.commPrivilege" : 1,
		"compagnies.immeubles.unites.locataires.lha" : 1
		
};