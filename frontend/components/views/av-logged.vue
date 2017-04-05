<template>
    <div class="app" id="app">
    	<top-menu></top-menu>
    	<keep-alive>
			<router-view></router-view>
		</keep-alive>
    	<bottom-menu></bottom-menu>
    </div>
</template>
<script>
	import Vue from 'vue'
	import socket from 'socket.io-client'
	import classie from 'desandro-classie'
	import topMenu from '../partials/top-menu.vue'
	import bottomMenu from '../partials/bottom-menu.vue'

	export default {
	    name: 'avLogged',
	    components: {
	    	topMenu,
	    	bottomMenu,
	    },
	    data() {
	    	return {
	    		body: undefined
	    	}
	    },
	    computed: {
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
	    	 * @return Object (User)
	    	 */
	    	myself() {
	    		return this.$store.getters.myself;
	    	},

	    	/**
	    	 * Check if the app is being controlled by
	    	 * the root
	    	 * 
	    	 * @return boolean
	    	 */
	    	controlled() {
	    		return this.$store.getters.controlled;
	    	},

	    	/**
	    	 * Check if the user is root
	    	 */
	    	root() {
	    		return this.$store.getters.root;
	    	}
	    },
	    methods: {
	    	/**
	    	 * Set UI skins for the app
	    	 *
	    	 * @return void
	    	 */
	    	setBodyClasses() {
	    		this.body = document.getElementsByTagName("body")[0];
		    	if(this.myself.admin)
					classie.add(this.body, 'skin-red');
	    	},

	    	/**
			 * Register an event handler for
			 * the socket message event
			 * 
			 * @return void
			 */
	    	registerSocketMessageEvent() {
	    		this.$socket.on('message', (data) => {
					this.$store.commit('addMessage', data);
				});
	    	},

	    	/**
			 * Register an event handler for
			 * the socket users.all event
			 * 
			 * @return void
			 */
	    	registerSocketUsersAllEvent() {
	    		this.$socket.on('users.all', (data) => {
					if(this.myself.admin)
						this.$store.commit('setUsers', data);
				});
	    	},

	    	/**
			 * Register an event handler for
			 * the socket users.new event
			 * 
			 * @return void
			 */
	    	registerSocketUsersNewEvent() {
	    		this.$socket.on('users.new', (data) => {
					if(this.myself.admin)
					{
						this.$store.commit('addUser', data);
					}
				});
	    	},

	    	/**
			 * Register an event handler for
			 * the socket users.controlling event
			 * 
			 * @return void
			 */
	    	registerSocketUsersControllingEvent() {
	    		this.$socket.on('users.controlling', (data) => {
	    			this.$store.commit('setUserInCharge', data);
	    			if(!this.myself.admin)
	    			{
	    				if(data.id == this.myself.id)
						{
							classie.add(this.body, 'skin-red');
						}
						else
						{
							classie.remove(this.body, 'skin-red');
						}
	    			}
				});
	    	},

	    	/**
	    	 * Register an event handler for
	    	 * the socket users.delete event
	    	 * 
	    	 * @return void
	    	 */
	    	registerSocketUsersDeleteEvent() {
	    		this.$socket.on('users.delete', (data) => {
	    			this.$store.commit('delUser', data);
	    		});
	    	},

	    	/**
	    	 * Register an event handler for
	    	 * the socket path event
	    	 * 
	    	 * @return void
	    	 */
	    	registerSocketPathEvent() {
	    		this.$socket.on('app.path', (data) => {
	    			if(this.controlled)
	    			{
	    				this.$router.push(data);
	    			}
	    		});
	    	},

	    	/**
	    	 * Register an event handler for
	    	 * the socket new file event
	    	 * 
	    	 * @return void
	    	 */
	    	registerSocketFileEvent() {
	    		this.$socket.on('files.new', (data) => {
	    			this.$store.commit('addFile', data);
	    		});
	    	},
	    },
	    watch: {
	    	/**
	    	 * Emit a path event if the
	    	 * user is root
	    	 *
	    	 * @return void
	    	 */
	    	'$route.path'(val) {
	    		if(this.root)
		    		this.$socket.emit('app.path', val);
	    	}
	    },
	    created() {
	    	this.setBodyClasses();
	    	this.registerSocketMessageEvent();
	    	this.registerSocketUsersAllEvent();
	    	this.registerSocketUsersControllingEvent();
	    	this.registerSocketUsersNewEvent();
	    	this.registerSocketUsersDeleteEvent();
	    	this.registerSocketPathEvent();
	    	this.registerSocketFileEvent();
	    },
	}
</script>