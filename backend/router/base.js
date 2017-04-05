var config = require('../config');
var session = require('../models/session');
var users = require('../models/user');

var jwt = require('jsonwebtoken');
var express = require('express');
var baseRoutes = express.Router();

function isEmpty(obj) { 
	for (var x in obj) { return false; }
	return true;
}

baseRoutes.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/index.html'));
});

baseRoutes.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	if(!username || !password)
	{
		res.status(400).json({ success: false, message: 'Username and password are required fields.' });
		return;
	}

	users.login(username, password, (err, incomingUser) => {
		if(isEmpty(incomingUser))
		{
			res.status(403).json({ success: false, message: 'Wrong credentials.' });
			return;
		}
		
		session.find(incomingUser.id, function(err, alreadyLogged){
			if(!isEmpty(alreadyLogged))
			{
				res.status(403).json({ success: false, message: 'User already logged in.' });
				return;
			}

			let convertedUser = users.public(incomingUser);

		    session.upsert(convertedUser);
		    
		    let info = {
				success: true, 
				message: 'Welcome aboard!',
				token: jwt.sign(convertedUser, config.secretHash)
			}
			res.json(info);
		});
	});
});

module.exports = baseRoutes