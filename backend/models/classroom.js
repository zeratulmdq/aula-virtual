var classrooms = [];

exports.all = classrooms;

exports.new = function() {
	return {
		name: '',
		created_at: null,
		app: {
			owner: {},
			users: [],
			currentPath: 'code',
			controller: {},
		},
		messages: [],
		codemirror: {
			text: '',
			cursor: { line:0, ch:0 },
			selection: { start: { line: 5, ch: 1 }, end: { line: 5, ch: 1 } },
		},
		pdf: {
			file: '',
			currentPage: 0
		},
		files: [],
		lines: [],
	}
}

exports.add = function(classroom) {
	classrooms.unshift(classroom);
}

exports.exists = function(name) {
	for(var i = 0; i<classrooms.length; i++)
		if(classrooms[i].name == name) return true;

	return false;
}

exports.names = function() {
	var names =  classrooms.map(function(item){
		return item.name;
	});

	return names;
}
var info = function() {
	var info =  classrooms.map((item) =>{
		return {
			name: item.name,
			created_at: item.created_at,
			teacher: item.app.owner.fullName
		}
	});

	return info;
}

exports.info = info;

exports.infoByName = function(name) {
	return info().find(function(c){
		return c.name == name;
	});
}

exports.findByName = function (name) {
	return classrooms.find(function(c){
		return c.name == name;
	});
}