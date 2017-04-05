<template>
	<div class="login__wrapper" id="app">
		<div class="login__box" :class="classes">
	        <div class="login__logo">
	            <div class="login__titulo">
	                <a href="#"><b>A</b>ula virtual</a>
	            </div>
	            <div class="login__subtitulo">
	                <span>UTN - MDQ</span>
	            </div>
	            <hr class="login__hr">
	        </div>
	        <div class="login__body">
	            <p class="login__msg">{{ $t("login.title") }}</p>
	            <p class="login__msg login-error">{{apiError}}</p>
	            <form>
	                <div class="login__formgroup">
	                    <input v-model="username" name="username" type="texto" class="login__formcontrol" :placeholder="$t('login.userPlaceholder')">
	                    <span class="glyphicon glyphicon-envelope login__formcontrol-feedback"></span>
	                </div>
	                <div class="login__formgroup">
	                    <input v-model="password" name="password" type="password" class="login__formcontrol" :placeholder="$t('login.passwordPlaceholder')">
	                    <span class="glyphicon glyphicon-lock login__formcontrol-feedback"></span>
	                </div>
	                <div class="login__row">
	                    <div class="login__5">
		                    <select class="login__formcontrol" v-model="lang">
				        		<option value="es_AR">Español</option>
				        		<option value="en">English</option>
				        	</select>
	                        <!--<a href="#">{{ $t("login.forgotPassword") }}</a>-->
	                    </div>
	                    <div class="login__5 login__separate_2">
	                        <button @click.prevent="login" type="submit" class="btn btn__primary right">{{ $t("login.login") }}</button>
	                    </div>
	                </div>
	            </form>
	        </div>
	    </div>
    </div>
</template>

<script>
	import Vue from 'vue'

	export default {
	    name: 'avLogin',
	    data() {
	    	return {
	    		username: '',
	    		password: '',
	    		classes: '',
	    		apiError: '',
	    	}
	    },
	    computed: {
	    	/**
	    	 * Return the payload to perform login
	    	 * 
	    	 * @return Object
	    	 */
	    	loginCredentials() {
	    		return {
	    			username: this.username,
	    			password: this.password,
	    		}
	    	},
	    	/**
	    	 * Return and set 
	    	 * the lang to display
	    	 * 
	    	 * @type Object
	    	 */
	    	lang: {
                get () {
                    return this.$store.state.lang;
                },
                set (value) {
                    this.$store.commit('setLang', value);
                    Vue.config.lang = value;
                }
            }
	    },
	    methods: {
	    	/**
	    	 * Make an API POST request to login
	    	 * 
	    	 * @return void
	    	 */
	    	login()	{
	    		this.$http.post('/login', this.loginCredentials).then((response) => {
	    			this.$store.commit('setToken', response.data.token);
	    			this.$router.push('home');
	    		}, (response) => {	
	    			this.classes = 'cambiarcolor';
	    			this.apiError = response.data.message;
	    			setTimeout(() => {
	    				this.classes = '';
	    			}, 2000);
	    		});
	    	}
	    },
	}
</script>
<style>
	.login__wrapper {
		background-color: #222d32;
		padding-top: 7%;
		min-height: 100%;
	}
	.login__box {
		background-color: #FFF;
		opacity: 1;
		width: 360px;
		margin: 0 auto;
		color: #333;
	    font-size: 14px;
	    text-align: center;
	    line-height: 1.42857;
	}
	.login__logo {
		margin: 0;
		padding-top: 25px;
		font-size: 35px;
	    font-weight: 300;
	    text-align: center;
	}

	.login__titulo > a {
		color: #333;
	}

	.login__subtitulo {
		font-size: 15px;
	}

	.login__body {
		color: #666;
		padding: 20px;
	}

	.login__msg {
		font-size: 14px;
	    font-weight: 400;
	    margin: 0;
	    padding: 0 20px 20px;
	}

	.login__formgroup {
		margin-bottom: 15px;
		position: relative;
	}

	.login__formcontrol {
		width: 100%;
		background-color: #FFF;
		border: 1px solid #d2d6de;
		padding: 6px 12px;
		color: #555;
	    display: block;
	    font-size: 14px;
	    line-height: 1.42857;;
	}

	.login__hr {
		border: 2px solid #008d4c;
		max-width: 50px;
		margin-bottom: 0;
	}

	.login__row {
		margin: 0 -15px;
		overflow: auto;
	}
	.login__5 {
		width: 41.6667%;
		min-height: 1px;
	    padding-left: 15px;
	    padding-right: 15px;
	    position: relative;
	    float: left;
	}

	.login__separate_2 {
		margin-left: 16.6667%;
	}
	@keyframes backchange {
		0% { opacity: 1; }
		50% { opacity: 0; }  
		100% { opacity: 1; }
	}
	.cambiarcolor {
		animation: backchange 1s;
	}
	.login-error {
		color: #F44336;
	}
</style>