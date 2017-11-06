var Client = require("../data/structure.js");
var Utils = require("../utils/utils.js");

var pushClient = function(req,res) {
	
	var noClient = req.params.noClient;
	var uSess = req.uSess;
	if (validateSession(uSess,noClient) == false) {
		res.status(403)
		.json({message: "Client invalide ou accès refusé"});
		return;
	}
	
	var data = req.body.data;
	
	if (! data) {
		res.status(403)
		.json({message: "Données client manquantes"});
		return;
	}
	
	var obj = null;
	try {
		obj = eval('(' + data + ')');
		var aDate = (new Date()).toISOString();
		var aDate = aDate.substring(0,10) + " " + aDate.substring(11,19);
		obj.lastPushedDate = aDate;
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
			res.status(500)
			.json({message: "Erreur : " + err});
		}
		
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
	
	var projection = {
		_id : 0,
		__v : 0
		//Compagnies._id : 0
	}
	
	Client.findOne({"noClient" : noClient},function(err, doc) {
	
		if (err) {
			res.status(500)
			.json({message: "Erreur : " + err});
		}
		
		if (doc == null) {
			res.status(404)
			.json({message : "Aucune donnée pour client " + noClient})
		}
		else {
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

module.exports = {
	push : pushClient,
	exp : exportClient
};