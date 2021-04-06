var express = require("express");
var router = express.Router();
var config = require("../configApi.js");



var _resetLastPushed = function(req,res) {
	
	var User = (require("../api/data/user.js"));
	
	
	User.find(function(err,arrUsers) {
	
		for (var i=0; i < arrUsers.length ; i++) {
		
			var oneUser = arrUsers[i];
		
			for (var j= 0 ; j < oneUser.clients.length ; j++) {
				oneUser.clients[j].lastPushedDate = "2001-01-01 10:00:00";
			}
		
			oneUser.save(function(err,doc) {
				if (err) {
					console.log("reset failed");
					console.log(err);
					res
					.status(500)
					.json({  message: 'Error ' + err });	
					return;
				}
			});
		
		
		}
	
		res
		.status(200)
		.json({  message: 'Onreset' });	
		return;
	});
};


router
	.route("/resetLastPushed")
	.get(_resetLastPushed)
	.post(_resetLastPushed);
	

	

	
module.exports = router;

