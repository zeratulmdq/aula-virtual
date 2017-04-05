<template>
	<div class="container direct-chat direct-chat-danger" :class="{'container--shrink': shrinkContainer}">
		<div class="direct-chat-messages" ref="scrollDiv" :style="{height: calculatedHeight}">
			<av-message @inDom="scrollDown($event)" v-for="message in messages" :msg="message"></av-message>
		</div>
	</div>
</template>
<script>
	import avMessage from '../partials/av-message.vue'

	export default {
		name: 'avMessages',
		components: {
			avMessage,
		},
		computed: {
			/**
			 * Check if user is in control
			 * of the app
			 * 
			 * @return boolean
			 */
			root() {
				return this.$store.getters.root;
			},

			/**
			 * Return all stored messages
			 * 
			 * @return Array	List of messages
			 */
			messages() {
				return this.$store.state.messages;
			},

      /**
       * Check if top menu is
       * shrinked
       * 
       * @return boolean
       */
      shrinkContainer() {
          return this.$store.state.shrinkTopMenu;
      },

      /**
       * Calculate container height
       * based on menu size
       * 
       * @return String
       */
      calculatedHeight() {
          return this.$store.state.shrinkTopMenu ? 'calc(100vh - 120px)' : 'calc(100vh - 230px)';
      }

		},
		methods: {
			/**
			 * Set scroll position equals to
			 * the bottom of the container div
			 * 
			 * @return void
			 */
			goToBottom() {
				this.$refs.scrollDiv.scrollTop = this.$refs.scrollDiv.scrollHeight;
			},

			/**
			 * Check if the app should scroll
			 * to the bottom of the container div
			 * 
			 * @param  Int size		Size of recently inserted children
			 * @return void
			 */
			scrollDown(size) {
				let scrollTop = this.$refs.scrollDiv.scrollTop,
					scrollHeight = this.$refs.scrollDiv.scrollHeight,
					totalHeight = this.$refs.scrollDiv.offsetHeight;

				if(totalHeight + scrollTop + size + 40 > scrollHeight)
					this.goToBottom();
			}
		},
		mounted() {
			this.goToBottom();
		}
	}
</script>
<style>
	
</style>