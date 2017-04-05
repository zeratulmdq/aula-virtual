<template>
	<div class="container" :class="{'container--shrink': shrinkContainer}">
		<div class="files__wrapper"  :style="{height: calculatedHeight}">
			<form v-show="root" id="widget" method="post" enctype="multipart/form-data" action="/api/upload" class="dropzone"></form>
			<div v-if="files.length" class="row" style="margin-top:10px;">
				<av-file v-for="file in files" :file="file"></av-file>
			</div>
			<div v-else>
				<p class="no-files">{{ $t('files.noFiles') }}</p>
			</div>
		</div>
	</div>
</template>
<script>
	import dropzone from 'dropzone'
	import avFile from '../partials/av-file.vue'

	export default {
		name: 'avFiles',
		components: {
			avFile,
		},
		data() {
			return {
				dropzone: null
			}
		},
		computed: {
			/**
			 * Get uploaded files
			 * 
			 * @return Array	Array of file object
			 */
			files() {
				return this.$store.state.files;
			},

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
			 * Get JWT token
			 * 
			 * @return String	JWT token
			 */
			token() {
				return this.$store.state.token;
			},
			/**
			 * Get the current user in control
			 * 
			 * @return Object (User)
			 */
			userInCharge() {
				return this.$store.state.userInCharge;
			},

			/**
			 * Return the current classroom
			 * 
			 * @return String
			 */
			aula() {
				return this.$store.state.classroom;
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
                return this.$store.state.shrinkTopMenu ? 'calc(100vh - 100px)' : 'calc(100vh - 230px)';
            }
		},
		mounted() {
			/**
			 * Init dropzone instance
			 */
			this.dropzone = new dropzone(".dropzone", {
				paramName: 'file',
				maxFilesize: 5, // MB
				clickable: true,
				previewsContainer: false,
				dictDefaultMessage: '<i class="fa fa-upload"></i>',
				headers: {
					"x-access-token": this.token,
					"x-classroom-name": this.aula.name,
				}
			});
		}
	}
</script>
<style>
	.files__wrapper {
		overflow: auto;
	}
</style>