var db = require('../utils/db')

exports.all = function(cb) {
  var collection = db.get().collection('users')

  collection.find().toArray((err, docs) => {
    cb(err, docs)
  })
}

exports.login = function(username, password, cb) {
	var collection = db.get().collection('users')

	collection.findOne({
				$and: [
					{username: username},
					{password: password}
				]
	}, 
	(err, docs) => {
		cb(err, docs)
	});
}

exports.public = function(user) {
	return {
		id: user.id,
		fullName: user.fullName,
		username: user.username,
		admin: user.admin,
	}
}