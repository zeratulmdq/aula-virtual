<style>
	.avhome {
		overflow: auto;
		height: 100%;
		width: 100%;
	}

	.avhome__wrapper {
		background-image: url("/images/background.line.png");
	    background-repeat: repeat-y;
	    background-position: center;
	    padding-top: 75px;
	    overflow: visible;
	    width: 160px;
	    margin: 0 auto;
	}

	.avhome__create {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #FFF;
		z-index: 1000;
		cursor: pointer;
		padding: 20px 30%;
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
<template>
	<div class="avhome">
		<div v-if="myself.admin" class="avhome__create">
			<input @keyup.enter="createRoom" v-model="room" type="text" class="form-control" :placeholder="$t('home.createPlaceholder')">
			<button @click="createRoom" class="btn btn__primary">{{ $t('home.createButton') }}</button>
		</div>
		<div class="avhome__wrapper">
			<av-classroom v-for="(c, i) in aulas" :index="i" :aula="c"></av-classroom>
		</div>
	</div>
</template>
<script>
	import Vue from 'vue'
	import socket from 'socket.io-client'
	import avClassroom from '../partials/av-classroom.vue'

	export default {
		name: 'avHome',
		components: {
			avClassroom,
		},
		data() {
			return {
				room: '',
				aulas: []
			}
		},
		computed: {
			/**
			 * Return the user input after
			 * trimming
			 * 
			 * @return String
			 */
			trimmedRoom() {
				return this.room.trim();
			},
			/**
	    	 * Get the JWT token
	    	 * 
	    	 * @return String
	    	 */
			token() {
	    		return this.$store.state.token;
	    	},

	    	/**
	    	 * Get the JWT payload
	    	 * 
	    	 * @return Object (User)
	    	 */
	    	myself() {
	    		return this.$store.getters.myself;
	    	},
		},
		methods: {
			/**
			 * Create a new SocketIo instance and
			 * bind it globally
			 * 
			 * @return void
			 */
			initSocketio() {
				Vue.prototype.$socket = socket(
		    		//'localhost:3000',
			    	{
			    		query: 'token=' + this.token,
			    		path: '/api/socketio'
			    	}
		    	);
			},

			/**
			 * Create a new classroom
			 * 
			 * @return void
			 */
			createRoom() {
				if(this.trimmedRoom)
				{
					this.$socket.emit('classrooms.new', this.trimmedRoom);
				}
			},

			/**
			 * Register an event handler for
			 * socket classrooms.error event
			 * 
			 * @return void
			 */
			registerSocketClassroomError() {
				this.$socket.on('classrooms.error', (data) => {
	    			console.log(data);
	    		});
			},

			/**
			 * Register an event handler for
			 * socket classrooms.get event
			 * 
			 * @return void
			 */
			registerSocketClassroomGet() {
				this.$socket.on('classrooms.get', (data) => {
					this.aulas = data;
				});
			},

			/**
			 * Register an event handler for
			 * socket classrooms.set event
			 * 
			 * @return void
			 */
			registerSocketClassroomSet() {
				this.$socket.on('classrooms.set', (data) => {
					console.log(data);
					this.$store.commit('setClassroom', {name: data.name, teacher: data.app.owner.fullName});
					this.$store.commit('setMessages', data.messages);
	    			this.$store.commit('setUserInCharge', data.app.controller);
	    			this.$store.commit('setUsers', data.app.users);
	    			this.$store.commit('setPdfInit', data.pdf);
	    			this.$store.commit('setFiles', data.files);
	    			this.$store.commit('setWhiteboard', data.lines);
	    			this.$router.push(data.app.currentPath);
				});
			},

			/**
			 * Register an event handler for
			 * socket classrooms.add event
			 * 
			 * @return void
			 */
			registerSocketClassroomAdd() {
				this.$socket.on('classrooms.add', (data) => {
					this.aulas.unshift(data);
				});
			},

			/**
	    	 * Register an event handler for
	    	 * the socket crash event.
	    	 * 
	    	 * @return void
	    	 */
	    	registerSocketCrashEvent() {
	    		this.$socket.on('crash', () => {
		    		this.$store.commit('setToken', '');
		    		this.$router.push('/');
		    	});
	    	}
		},
		created() {
    		this.initSocketio();
    		this.registerSocketClassroomGet();
    		this.registerSocketClassroomSet();
    		this.registerSocketClassroomError();
    		this.registerSocketClassroomAdd();
    		this.registerSocketCrashEvent();
			this.$socket.emit('classrooms.get');
		}
	}
</script>