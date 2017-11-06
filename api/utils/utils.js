var _removeDBToken = function(obj) {

	for (prop in obj) {
		
		if (obj[prop] instanceof Array) {
			var arr = obj[prop];
			for (var i=0; i < arr.length; i++)
				arr[i] = _removeDBToken(arr[i]);
		}
		//else if (typeof obj[prop] === "object")
		//	obj[prop] = _removeDBToken(obj[prop]);
		else if (prop == "_id" || prop == "__v")
			delete obj[prop];
	}
	
	return obj;

};

module.exports = {
	_removeDBToken : _removeDBToken
};
