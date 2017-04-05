<template>
	<div class="avclassroom__class" @click="join(aula.name)">
		<img src="/images/pointer.png" class="avclassroom__pointer" :class="{'avclassroom__pointer--flip': index % 2 == 0}">
		<div class="avclassroom__image" :style="{backgroundImage: avatar}">
		</div>
		<div class="avclassroom__text" :class="{'avclassroom__text--left': index % 2 == 0}">
			<a>{{ aula.name }}</a>
			<span>{{ aula.teacher }}</span>
			<span>{{ displayDate(aula.created_at)}}</span>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'

	export default {
		name: 'avClassroom',
		props: ['index', 'aula'],
		data() {
			return {}
		},
		computed: {
			/**
			 * Hack for now
			 */
			avatar() {
				let num = Math.floor((Math.random() * 7) + 1);

				return  "url('/images/class." + num + ".jpg')";
			}
		},
		methods: {
			/**
			 * Join a classroom
			 * 
			 * @param  String classroom	Name of the classroom
			 * @return void
			 */
			join(classroom) {
				this.$socket.emit('classrooms.join', classroom);
			},

			/**
			 * Format date to display
			 * 
			 * @return String
			 */
			displayDate(date) {
				return moment(date).fromNow();
			}
		}
	}
</script>
<style>
	.avclassroom__class {
		background-color: #fff;
	    margin: 30px;
	    position: relative;
	    width: 100px;
	    cursor: pointer;
	}

	.avclassroom__pointer {
		z-index: 0;
		position: absolute;
		top: -10px;
		left: 45px;
	}
	.avclassroom__pointer--flip {
        transform: scaleX(-1);
        left: -55px;
	}

	.avclassroom__text {
		color: #333;
	    left: 150px;
	    position: absolute;
	    top: 5px;
	    width: 250px;
	    text-align: left;
	    top: -25px;
	}

	.avclassroom__text--left {
		left: -310px;
		text-align: right;
	}

	.avclassroom__text > a {
	    color: #333;
	    display: block;
	    font-size: 20px;
	}

	.avclassroom__text > span {
		color: #aaa;
		display: block;
	}

	.avclassroom__image {
	    background-size: contain;
	    border: 3px solid #333;
	    border-radius: 50%;
	    height: 100px;
	    overflow: hidden;
	    position: relative;
	    width: 100px;
	}
</style>