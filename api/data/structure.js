// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;




var locataireSchema =   new Schema({ 
    id:			Number,
	prenom:		String,
	nomLoc:		String,
	cellulaire:	String,
	residence:	String,
	posteRes:	String,
	bureau:		String,
	poste:		String,
	email:		String,
	loyActu:	Number,
	loyEven:	Number,
	dateEnt:	String,
	dateExp:	String,
	dateDep:	String,	
	sexe:		String,
	montRec:	Number,
	lha:		String,
	langue:		String
});


var uniteSchema = new Schema({ 
	id:			Number,
	unite:		String,
	nbPiece:	Number,
	etage:		String,
	codeOcc:	String,
	typLog:		String,
	loyActu:	Number,
	loyProj:	Number,
	valMarche:	Number,
	sficie:		Number,
	orient:		String,
	meuble:		Boolean,
	semiMeuble:	Boolean,
	laveuse:	Boolean,
	chauf:		Boolean,
	elect:		Boolean,
	station:	Boolean,
	eauChaude:	Boolean,
	patio:		Boolean,
	dernOcc:	String,
	actif:		Boolean,
	pacTitrte:	String,
	pacTexte:	String,
	locataires:	[locataireSchema]
});

var imcContSchema = new Schema({
	id: 		Number,
    codeCon:	String,
    contact:	String,
    titre:		String,
    tel1: 		String,
	tel2: 		String,
    exten1: 	String,
    exten2: 	String,
    telCell:	String,
    email: 		String,
    principal:  Boolean,
    comment: 	String

});
var imcBailLocSchema = new Schema({
	id:			Number,
	codeLoc:	String,
	nomLoc:		String,
	raisonSoc:	String,
	attFact:	String,
	nomFact:	String,
	adrFact1:	String,
	adrFact2:	String,
	adrFact3:	String,
	cpFact:		String,
	telFact:	String,
	emailFact:	String,
	nomResp:	String,
	telResp:	String,
	telResp2:	String,
	langue:		String,
	lha:		String,
	dateEnt:	String,
	dateDeb:	String,
	dateDebTer:	String,
	dateFin:	String,
	dateEch:	String,
	dateDep:	String,
	baseSur:	String,
	sficieU:	Number,
	sficieL:	Number,
	sficieA:	Number,
	mntFixe:	Number,
	tauxBase:	Number,
	mensAnn	:	String,
	imcConts:	[imcContSchema]
});

var localSchema = new Schema({
	id:			Number,
	unite:		String,
	baseSur:	String,
	sficieU:	Number,
	sficieL:	Number,
	sficieA:	Number,
	etat:		String,
	typeSf:		String,
	etage:		String,
	dernOcc:	String,
	note:		String,
	typeLocalDesc: String,
	tauxVacant: Number,
	baseSurVacant : String,
	mntFixeVacant : Number,
	mensAnnVacant: String,
	imcBailLocs:	[imcBailLocSchema]
});



var immeubleSchema = new Schema({
	id:			Number,
	immeuble:	String,
	nom:		String,
	adres1:		String,
	adres2:		String,
	adres3:		String,
	codePost:	String,
	zone:		String,
	unites:		[uniteSchema],
	locaux :	[localSchema]
});

var compagnieSchema = new Schema({
	id:			Number,
	noCie:		Number,
	noDiv:		Number,
	nomCieDiv:	String,
	immeubles:	[immeubleSchema]
});

var clientSchema = new Schema({
	noClient:		String,
	nom:			String,
	serialNo:		String,
	lastPushedDate: String,
	compagnies:  [compagnieSchema]
});

module.exports = mongoose.model("Client",clientSchema,"clients");

/*
Définitions:

[Locataire]
	ID			Identifiant unique (par client)
	PRENOM		Prénom du locataire
	NOMLOC		Nom du locataire
	CELLULAIRE	Téléphone cellulaire
	RESIDENCE	Téléphone à la résidence
	POSTERES	No de poste téléphonique à la résidence
	BUREAU		Téléphone au bureau
	POSTE		No de poste au bureau
	EMAIL		Courriel
	LOYACTU		Loyer actuel (bail courant)
	LOYEVEN		Loyer éventuel (bail futur)
	DATEENT		Date d'entrée/début du bail
	DATEEXP		Date de fin de bail
	DATEDEP		Date de départ	
	SEXE		Sexe
	MONTREC		Montant à recevoir
	
	
	
[Unite]
	ID			Identifiant unique (par client)
	UNITE		Code de l'unité/appartement
	NBPIECE		Nombre de pièces
	ETAGE		Étage
	CODEOCC		Code d'occupation (Loué, Vacant, Réservé, etc)
	TYPLOG		Type de logement
	LOYACTU		Loyer actuel
	LOYPROJ		Loyer projeté
	VALMARCHE	Valeur du loyer au marché
	SFICIE		Superficie
	ORIENT		Orientation géographique
	MEUBLE		Meublé ?
	SEMIMEUBLE	Semi-Meublé ?
	LAVEUSE		Entrée laveuse-sécheuse ?
	CHAUF		Chauffage inclus ?
	ELECT		Électricité comprise?
	STATION		Stationnement inclus ?
	EAUCHAUDE	Eau chaude incluse ?
	PATIO		Porte patio au logement ?
	DERNOCC		Dernière occupation de l'unité
	ACTIF		Actif ?
	Locataires	Array de [Locataire]
						

[Immeuble]
	ID			Identifiant unique (par client)
	IMMEUBLE	Code de l'immeuble
	NOM			Nom de l'immeuble
	ADRES1		Ligne 1 de l'adresse (No civique et rue)
	ADRES2		Ligne 2 de l'adresse (Ville)
	ADRES3		Ligne 3 de l'adresse (Province et pays)
	CODEPOST	Code prostal
	ZONE		Zone géographique
	Unites		Array de [Unite]
	
[Compagnie]	
	ID			Identifiant unique (par client)
	NOCIE		No de compagnie
	NODIV		No de division
	NOMCIEDIV	Nom de la compagnie/division
	Immeubles	Array de [Immeuble]

	
[Client]
	NoClient	Code du client
	Nom			Nom du client
	SerialNo	No de série Primmo
	ID			Identifiant du client CRM
	Compagnies  Array de [Compagnie]
			

----------------

Structure globale JSON

{
	(Propriétés client),
	"Compagnies": [{
		(Propriétés compagnie),
		"Immeubles" : [{
			(Propriétés immeuble),
			"Unites" : [{
				(Propriétés unité), 
				"Locataires" : [{
								(Propriétés locataire},{}, ...
								]
				}, 
				{} , 
				...
				]
			}, 
			{}, 
			...
		]
		}, 
		{}, 
		...
	]
}


			
				

exemple:

{
	"NoClient": "HOPEM",
	"Nom": "Les Immeubles Hopem",
	"SerialNo": "JXJD191HT10CF3L",
	"ID": "{7F79EA82-8D08-422F-AD29-335CE22CDB11}",
	"Compagnies": [{
		"ID": 7,
		"NOCIE": 3,
		"NODIV": 1,
		"NOMCIEDIV": "Gestion  Belles Maisons Inc.",
		"Immeubles": [{
			"ID": 27,
			"IMMEUBLE": "1000PINS",
			"NOM": "IMMEUBLE LA PINEDE 1",
			"ADRES1": "1000 des Pins",
			"ADRES2": "Québec",
			"ADRES3": "QC",
			"CODEPOST": "G1V 4R5",
			"ZONE": "Ste-Foy",
			"Unites": [{
					"ID": 156,
					"UNITE": "    101",
					"NBPIECE": 4.5,
					"ETAGE": "1",
					"CODEOCC": "L",
					"TYPLOG": "STUDIO",
					"LOYACTU": 1000,
					"LOYPROJ": 1025,
					"VALMARCHE": 1000,
					"SFICIE": 30,
					"ORIENT": "SUD",
					"MEUBLE": false,
					"SEMIMEUBLE": false,
					"LAVEUSE": true,
					"CHAUF": true,
					"ELECT": true,
					"STATION": true,
					"EAUCHAUDE": true,
					"PATIO": true,
					"DERNOCC": "2018-06-30",
					"ACTIF": true,
					"Locataires": [{
							"ID": 7,
							"PRENOM": "Louise",
							"NOMLOC": "Bérard",
							"CELLULAIRE": "15814730981",
							"RESIDENCE": "14186521234",
							"POSTERES": "234",
							"BUREAU": "14186580909",
							"POSTE": "1265",
							"EMAIL": "lberard@hotmail.com",
							"LOYACTU": 1000,
							"LOYEVEN": 1025,
							"DATEENT": "2013-07-01",
							"DATEEXP": "2018-06-30",
							"DATEDEP": null,
							"SEXE": "F",
							"MONTREC": 200
						},
						{
							"ID": 7,
							"PRENOM": "Marc",
							"NOMLOC": "Fortier",
							"CELLULAIRE": "15819981254",
							"RESIDENCE": "14186521234",
							"POSTERES": "234",
							"BUREAU": "141865807909",
							"POSTE": "1265",
							"EMAIL": "mfortier@outlook.com",
							"LOYACTU": 1000,
							"LOYEVEN": 1025,
							"DATEENT": "2013-07-01",
							"DATEEXP": "2018-06-30",
							"DATEDEP": null,
							"SEXE": "M",
							"MONTREC": 0
						}
					]
				},
				{
					"ID": 216,
					"UNITE": "    102",
					"NBPIECE": 5.5,
					"ETAGE": "1",
					"CODEOCC": "L",
					"TYPLOG": "SPLIT",
					"LOYACTU": 1000,
					"LOYPROJ": 1025,
					"VALMARCHE": 1050,
					"SFICIE": 30,
					"ORIENT": "NORD",
					"MEUBLE": false,
					"SEMIMEUBLE": false,
					"LAVEUSE": true,
					"CHAUF": true,
					"ELECT": true,
					"STATION": true,
					"EAUCHAUDE": true,
					"PATIO": true,
					"DERNOCC": "2018-06-30",
					"ACTIF": true,
					"Locataires": [{
							"ID": 45,
							"PRENOM": "Lise",
							"NOMLOC": "Cyr",
							"CELLULAIRE": "14184651922",
							"RESIDENCE": "14185637445",
							"POSTERES": null,
							"BUREAU": "14184461207",
							"POSTE": null,
							"EMAIL": "lc9999@gmail.com",
							"LOYACTU": 990,
							"LOYEVEN": 1025,
							"DATEENT": "2016-07-01",
							"DATEEXP": "2017-06-30",
							"DATEDEP": "2017-06-30",
							"SEXE": "F",
							"MONTREC": 0
						},
						{
							"ID": 187,
							"PRENOM": "Luc",
							"NOMLOC": "Dion",
							"CELLULAIRE": "15819832705",
							"RESIDENCE": null,
							"POSTERES": null,
							"BUREAU": null,
							"POSTE": null,
							"EMAIL": "ld9999@gmail.com",
							"LOYACTU": 1000,
							"LOYEVEN": 1025,
							"DATEENT": "2017-07-01",
							"DATEEXP": "2018-06-30",
							"DATEDEP": null,
							"SEXE": "M",
							"MONTREC": 1000
						}
					]
				}
			]

		}, {
			"IMMEUBLE": "1005PINS",
			"NOM": "IMMEUBLE LA PINEDE II",
			"ID": 31,
			"ADRES1": "1005 des Pins",
			"ADRES2": "Québec",
			"ADRES3": "QC",
			"CODEPOST": "G1V 4R5",
			"ZONE": "Ste-Foy",
			"Unites": []
		}, {
			"IMMEUBLE": "1007PINS",
			"NOM": "IMMEUBLE LA PINEDE III",
			"ID": 33,
			"ADRES1": "1007 des Pins",
			"ADRES2": "Québec",
			"ADRES3": "QC",
			"CODEPOST": "G1V 4R5",
			"ZONE": "Ste-Foy",
			"Unites": []
		}]
	}, {

	}]
}

*/
