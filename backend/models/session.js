var db = require('../utils/db')

exports.clear = function() {
	var collection = db.get().collection('session');
	collection.remove({});
}

exports.upsert = function(user) {
	var collection = db.get().collection('session');
	collection.update({ id: user.id }, user, { upsert: true });
}

exports.find = function(id, cb) {
	var collection = db.get().collection('session');
	collection.findOne({ id: id }, (err, doc) => {
		cb(err, doc);
	});
}

exports.delete = function(id) {
	var collection = db.get().collection('session');
	collection.deleteOne({id: id});
}

exports.all = function(cb) {
	var collection = db.get().collection('session');
	collection.find().toArray(function(err, docs) {
    	cb(err, docs);
    });
}