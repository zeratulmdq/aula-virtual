<style>
	.direct-chat-wrapper {
		width: 100%;
		overflow: auto;
	}
</style>
<template>
	<div class="direct-chat-wrapper">
		<div class="direct-chat-msg" :class="{'right': msgIsMine}">
			<div class="direct-chat-info clearfix">
				<span class="direct-chat-name" :class="{'pull-left': !msgIsMine, 'pull-right': msgIsMine}">{{ msg.user.username }}</span>
				<span class="direct-chat-timestamp" :class="{'pull-left': msgIsMine, 'pull-right': !msgIsMine}">{{ prettyDate(msg.timestamp) }}</span>
			</div>
			<div class="direct-chat-text">
				{{ msg.text }}
			</div>
		</div>
	</div>
</template>
<script>
	import moment from 'moment'

	export default {
		name: 'avMessage',
		props: ['msg'],
		methods: {
			/**
			 * Format date to display
			 * 
			 * @param  Int timestamp 	Unix timestamp
			 * @return Momentjs instance
			 */
			prettyDate(timestamp) {
				return moment(timestamp).format('H:mm');
			}
		},
		computed: {
			/**
			 * Check whether the user owns the
			 * message or not
			 * 
			 * @return Boolean
			 */
			msgIsMine() {
				return this.msg.user.id == this.$store.getters.myself.id;
			}
		},
		mounted() {
			this.$emit('inDom', this.$el.offsetHeight);
		}
	}
</script>