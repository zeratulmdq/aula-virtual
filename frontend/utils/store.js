import Vue from 'vue'
import Vuex from 'vuex'
import jwtDecode from 'jwt-decode'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		showUsers: false,
		token: '',
		classroom: {},
		messages: [],
		users: [],
		files: [],
		whiteboard: [],
		userInCharge: {
			id: 0,
			fullName: ''
		},
		managed: true,
		pdfInit: {},
		lang: 'es_AR',
		shrinkTopMenu: false,
	},
	mutations: {
		showUsers(state) {
			state.showUsers = true;
		},
		hideUsers(state) {
			state.showUsers = false;
		},
		setToken(state, token) {
			state.token = token;
		},
		setClassroom(state, classroom) {
			state.classroom = classroom;
		},
		logout(state) {
			state.token = '';
		},
		setMessages(state, messages) {
			state.messages = messages;
		},
		addMessage(state, message) {
			state.messages.push(message);
		},
		setUsers(state, users) {
			state.users = users;
		},
		addUser(state, user) {
			state.users.push(user);
		},
		delUser(state, id) {
			state.users = state.users.filter((user) => {
				return user.id != id;
			});
		},
		setUserInCharge(state, user) {
			state.userInCharge = user;
		},
		setManagedApp(state) {
			state.managed = true;
		},
		setUnmanagedApp(state) {
			state.managed = false;
		},
		setManaged(state, value) {
			state.managed = value;
		},
		setFiles(state, files) {
			state.files = files;
		},
		addFile(state, file) {
			state.files.push(file);
		},
		setPdfInit(state, pdf) {
			state.pdfInit = pdf;
		},
		setCodemirrorInit(state, codemirror) {
			state.codemirrorInit = codemirror;
		},
		setWhiteboard(state, whiteboard) {
			state.whiteboard = whiteboard;
		},
		setLang(state, lang) {
			state.lang = lang;
		},
		toggleTopMenu(state) {
			state.shrinkTopMenu = !state.shrinkTopMenu;
		}
	},
	getters: {
		myself: state => {
			return jwtDecode(state.token);
		},
		/*colorClass: (state, getters) => {
			return getters.root ? 'danger' : 'primary';
		},*/
		root: (state, getters) => {
			return state.userInCharge.id == getters.myself.id;
		},
		controlled: (state, getters) => {
			return !getters.root && state.managed;
		},
		iAmTeacher(state, getters) {
			return getters.myself.fullName == state.classroom.teacher;
		}
	}
})