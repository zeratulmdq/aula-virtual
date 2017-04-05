var config = require('../config');
var classrooms = require('../models/classroom');

var jwt = require('jsonwebtoken');
var express = require('express');
var apiRoutes = express.Router();
var busboy = require('connect-busboy');
var fs = require('fs');
var path = require('path');
var spawn = require( 'child_process' ).spawn;

var mimetypes = [
	'application/pdf',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/msword',
	'application/vnd.oasis.opendocument.text',
];

function convertExtension(file) {
	let parts = file.fullName.split('.');
	parts.pop();
	let newName = parts.join('.') + '.pdf';
	file.fullName = newName;
	file.path = '/files/' + newName;
}

function isValidMimetype(mimetype) {
	let filter = mimetypes.filter((mime) => {
		return mime == mimetype;
	});

	return filter.length == 1;
}

function processFile(fieldname, file, filename, encoding, mimetype) {
	let parts = filename.split('.');
	parts.pop();
	newFile = {
		fullName: filename,
		name: parts.join('.'),
		path: '/files/' + filename,
		mimetype: mimetype,
	}
	fstream = fs.createWriteStream(path.join(__dirname + '/../../public' + newFile.path));
	file.pipe(fstream);

	return newFile;
}

function transformFile(file, res, io) {
	ls = spawn('/usr/bin/soffice', 
				['--headless',
				'--convert-to',
				'pdf',
				'--outdir',
				'/home/colo/Proyectos/utn_te_martin/public/files',
				'/home/colo/Proyectos/utn_te_martin/public/files/' + file.fullName]);

	ls.on( 'close', code => {
		if(code == 0)
		{
			convertExtension(newFile);
			socketInfo.pdf.file = newFile;
			io.emit('pdf.newFile', newFile);
	    	return res.status(201).send({ 
				success: true, 
				message: 'File uploaded correctly.' 
			});
		}
		
	});
}

module.exports = function(io) {
	apiRoutes.use(busboy());

	apiRoutes.use((req, res, next) => {
		var token = req.headers['x-access-token'];

		if (token) {
			jwt.verify(token, config.secretHash, (err, decoded) => {      
				if (err) {
					return res.status(403).send({ 
						success: false, 
						message: 'Failed to authenticate token.' 
					});
				} else {
					req.decoded = decoded;    
					next();
				}
			});
		} else {
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.' 
			});
		}
	});

	apiRoutes.post('/upload', (req, res) => {
		var aula = req.headers['x-classroom-name'];

		if(!aula)
			return res.status(400).send({ 
				success: true, 
				message: 'Classroom header not present.' 
			});

		var classroom = classrooms.findByName(aula);

		if(classroom === undefined)
			return res.status(403).send({ 
				success: true, 
				message: 'Classroom does not exist.' 
			});

		if(req.decoded.id != classroom.app.controller.id)
			return res.status(403).send({ 
				success: true, 
				message: 'You are not admin.' 
			});

	    if (req.busboy) {
	    	let newFile = {};
		    req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		    	newFile = processFile(fieldname, file, filename, encoding, mimetype);
		    });
		    req.pipe(req.busboy);
		    req.busboy.on('finish', () => {
		    	classroom.files.push(newFile);
		    	io.emit('files.new', newFile);
		    	return res.status(201).send({ 
					success: true, 
					message: 'File uploaded correctly.' 
				});
		    });
		}
	});

	apiRoutes.post('/pdf', (req, res) => {
		var aula = req.headers['x-classroom-name'];

		if(!aula)
			return res.status(400).send({ 
				success: true, 
				message: 'Classroom header not present.' 
			});

		var classroom = classrooms.findByName(aula);

		if(classroom === undefined)
			return res.status(403).send({ 
				success: true, 
				message: 'Classroom does not exist.' 
			});

		if(req.decoded.id != classroom.app.controller.id)
			return res.status(403).send({ 
				success: true, 
				message: 'You are not admin.' 
			});
		
	    if (req.busboy) {
	    	let newFile = {};
		    req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		    	console.log(mimetype);
		    	if(isValidMimetype(mimetype))
		    	{
		    		newFile = processFile(fieldname, file, filename, encoding, mimetype);
		    	} 
		    	else 
		    	{
			    	return res.status(403).send({ 
						success: false, 
						message: 'Mimetype not supported' 
					});
			    }
		    });
		    req.pipe(req.busboy);
		    req.busboy.on('finish', () => {
		    	if(newFile.mimetype != 'application/pdf')
		    	{
		    		transformFile(newFile, res, io);
		    	}
		    	else
		    	{
		    		classroom.pdf.file = newFile;
		    		io.emit('pdf.newFile', newFile);
		    		return res.status(201).send({ 
						success: true, 
						message: 'File uploaded correctly.' 
					});
		    	}
		    });
		}
	});

	return apiRoutes;
}
