var port = process.env.PORT || 3000;

var baseRoutes = require('./router/base.js');
var session = require('./models/session');
var config = require('./config');
var classrooms = require('./models/classroom')

var path = require('path');
var bodyParser  = require('body-parser');
var express = require('express');
var socketioJwt = require('socketio-jwt');

var app = express();
var server = require('http').Server(app);

var database = require('./utils/db');

database.connect('mongodb://localhost/' + config.mongodb.collection, (err) => {
	if (err) {
		console.log('Unable to connect to Mongo.');
		process.exit(1);
	}
	session.clear();
});

/**
 * HTTP server config
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/../public/')));
app.use('/', baseRoutes);

/**
 * Socket.io server
 */

var io = require('socket.io')(server, {path: '/api/socketio'});

io.use(socketioJwt.authorize({
	secret: config.secretHash,
	handshake: true
}));

io.on('connection', (socket) => {
	//**//
	console.log(socket.id);
	/**
	 * User-socketid binding
	 */
	//**//
	let id = socket.decoded_token.id;

	// TODO: deduplicate this event 
	 //**//
	socket.on('disconnect', (data) => {
		io.emit('users.delete', id);
		session.delete(id);
	});

	//**//
	socket.on('logout', () => {
		io.emit('users.delete', id);
		session.delete(id);
	});

	socket.classroom = null;

	session.find(id, (err, user) => {
		// REVISAR 
		if(!user)
		{
			socket.emit('crash');
			return;
		}
		user.socketid = socket.id;
		var classroom = null;

		socket.on('classrooms.new', (data) => {
			if(!user.admin)
				return;

			if(classrooms.exists(data))
			{
				socket.emit('classrooms.error', 'Classroom already created');
			}
			else
			{
				classroom = classrooms.new();
				classroom.name = data;
				classroom.app.owner = user;
				classroom.app.users.push(user);
				classroom.app.controller = user;
				classroom.created_at = new Date();
				
				classrooms.add(classroom);
				
				socket.classroom = data;
				socket.join(data);
				socket.emit('classrooms.set', classroom);
				io.emit('classrooms.add', classrooms.infoByName(data));
			}
		});

		socket.on('classrooms.get', () => {
			socket.emit('classrooms.get', classrooms.info());
		});

		socket.on('classrooms.join', (data) => {
			if(classrooms.exists(data))
			{
				classroom = classrooms.findByName(data);
				classroom.app.users.push(user);
				socket.emit('classrooms.set', classroom);
				socket.join(data);
  				socket.to(data).emit('users.new', user);
				socket.classroom = data;
			}
			else
				socket.emit('classrooms.error', 'Classroom does not exists');
		});
		
		/**
		 * Change user controlling the app
		 */
		socket.on('users.controlling', (data) => {
			if(user.admin && classroom.app.owner.id == user.id)
			{
				classroom.app.controller = data;
				io.in(socket.classroom).emit('users.controlling', data);
			}
		});
		/**
		 * Message event
		 */
		socket.on('message', (data) => {
			let payload = {
				text: data,
				user: {
					id: user.id,
					username: user.username
				},
				timestamp: new Date()
			}
			classroom.messages.push(payload);
			io.in(socket.classroom).emit('message', payload);
		});

		/**
	     * App path event
	     * 
	     * @return void
	     */
	    socket.on('app.path', (data) => {
	    	if(user.id === classroom.app.controller.id)
			{
				socket.to(socket.classroom).emit('app.path', data);
				classroom.app.currentPath = data;	
			}
	    });

		/**
		 * CodeMirror init event
		 */
		socket.on('codemirror.init', () => {
			socket.emit('codemirror.init', classroom.codemirror);
		});

		/**
		 * CodeMirror text event
		 */
		socket.on('codemirror.text', (data) => {
			if(user.id === classroom.app.controller.id)
			{
				socket.to(socket.classroom).emit('codemirror.text', data);
				classroom.codemirror.text = data;
			}
	    });

	    /**
	     *	Codemirror cursor event
	     **/
	    socket.on('codemirror.cursor', (data) => {
			if(user.id === classroom.app.controller.id)
			{
				socket.to(socket.classroom).emit('codemirror.cursor', data);
				classroom.codemirror.cursor = data;
			}
	    });

	    /**
	     *	Codemirror selection event
	     **/
	    socket.on('codemirror.selection', (data) => {
			if(user.id === classroom.app.controller.id)
			{
				socket.to(socket.classroom).emit('codemirror.selection', data);
				classroom.codemirror.selection = data;
			}
	    });


	     /**
	     *  Whiteboard draw event
	     **/
	    socket.on('whiteboard.draw', function (data) {
	        if(user.id === classroom.app.controller.id)
	        {
	            classroom.lines.push(data);
	            socket.to(socket.classroom).emit('whiteboard.draw', data);
	        }
	    });

	    /**
	     * Whiteboard clear event
	     **/
	    socket.on('whiteboard.clear', function(){
	        if(user.id === classroom.app.controller.id)
	        {
	        	socket.to(socket.classroom).emit('whiteboard.clear');
	            classroom.lines = [];
	        }
	    });
	    //io.in(socket.classroom).emit('evento', datos);
			//socket.to(socket.classroom).emit('evento', data);
	    /**
	     * Pdf change page event
		 *
	     * @return void
	     */
	    socket.on('pdf.changePage', (data) => {
	    	if(user.id === classroom.app.controller.id)
			{
				socket.to(socket.classroom).emit('pdf.changePage', data);
				classroom.pdf.currentPage = data;
			}
	    });
	});
});

var apiRoutes = require('./router/api.js')(io);
app.use('/api', apiRoutes);

/**
 * Start HTTP server
 */
server.listen(port, () => {
  	console.log('Server running: port %d', port);
});