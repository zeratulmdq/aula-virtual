<template>
	<div class="avstudents" v-show="show">
		<div class="avstudent ripple avstudent__blue" v-for="user in users" @click="changeUserInControl(user.id)">
			<p class="avstudent__initial">{{user.fullName.charAt(0)}}</p>
			<p class="avstudent__name">{{ user.fullName }}</p>
		</div>
		<!--<select class="form-control" v-model="selectedUser" @change="changeUserInControl">
                    <option v-for="user in users" :value="user">{{ user.fullName }}</option>
                </select>-->
	</div>
</template>
<script>
	export default {
		name: 'avStudents',
		data() {
			return {
				colours: ['avstudent__purple', 'avstudent__blue', 'avstudent__red', 'avstudent__green', 'avstudent__teal', 'avstudent__amber'],
			}
		},
		computed: {
			show() {
				return this.$store.state.showUsers;
			},

			/**
             * Return a list of logged users
             * 
             * @return Array (Object/User)
             */
            users() {
                return this.$store.state.users;
            },
		},
		methods: {
			randomClass() {
				let index = Math.floor(Math.random() * 3);
				
				return this.colours[index];
			},
			findUser(id) {
				return this.users.find((user) => {
					return user.id == id;
				})
			},
			/**
             * Change the user controlling the
             * app and assets
             * 
             * @return void
             */
            changeUserInControl(id) {
                this.$socket.emit('users.controlling', this.findUser(id));
                this.$store.commit('hideUsers');
            },
		}
	}
</script>
<style>
	.avstudents {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1500;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.avstudent {
		margin: 10px;
		width: 150px;
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
	}

	.avstudent__initial {
		font-size: 100px;
		color: #FFF;
		margin: 0;
		text-align: center;
	}

	.avstudent__name {
		font-size: 12px;
		padding: 0px 15px;
		word-break: break-all;
		text-align: center;
	}

	.avstudent__purple {
		background-color: #9c27b0;
	}

	.avstudent__purple > .avstudent__name {
		color: #e1bee7;
	}

	.avstudent__blue {
		background-color: #2196f3;
	}

	.avstudent__blue > .avstudent__name {
		color: #bbdefb;
	}

	.avstudent__amber {
		background-color: #ffc107;
	}

	.avstudent__amber > .avstudent__name {
		color: #ffecb3;
	}
	.avstudent__teal {
		background-color: #009688;
	}

	.avstudent__teal > .avstudent__name {
		color: #b2dfdb;
	}
	.avstudent__red {
		background-color: #f44336;
	}

	.avstudent__red > .avstudent__name {
		color: #ffcdd2;
	}
	.avstudent__green {
		background-color: #4caf50;
	}

	.avstudent__green > .avstudent__name {
		color: #c8e6c9;
	}
</style>