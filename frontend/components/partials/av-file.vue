<template>
	<div class="avfile">
		<div class="avfile__wrapper">
			<div class="avfile__description">
				<p class="avfile__name">{{ file.name }}</p>
				<p class="avfile__uploader" v-once>{{ userInCharge.fullName }}</p>
			</div>
			<div class="avfile__download">
				<a :href="file.path" :download="file.name">
					<i class="fa fa-download"></i>
				</a>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'avFile',
		props: ['file'],
		computed: {
			/**
			 * Get the current user in control
			 * 
			 * @return Object (User)
			 */
			userInCharge() {
				return this.$store.state.userInCharge;
			},
		}
	}
</script>
<style>
	.avfile {
		width: 25%;
		box-sizing: border-box;
		padding: 10px;
		height: 100px;
		float: left;
	}

	.avfile__wrapper {
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
		width: 100%;
		background-color: #F44336;
		overflow: auto;
		height: 100%;
	}

	.avfile__description {
		float: left;
		width: 75%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100%;
		padding: 10px;
	}

	.avfile__description > p {
		margin: 5px 0;
	}

	.avfile__name {
		font-size: 20px;
		max-height: 20px;
		line-height: 1;
		overflow: hidden;
		color: #FFF;
	}

	.avfile__uploader {
		font-size: 12px;
		overflow: hidden;
		color: #ffcdd2;
	}

	.avfile__download {
		background-color: #d32f2f;
		float: left;
		color: #FFF;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 25%;
	}
</style>