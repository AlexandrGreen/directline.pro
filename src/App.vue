<template>
	<form
		action=""
		method="get"
		class="form"
	>
		<div class="fields">
			<multi-select
				url="/categories"
				name="categories"
				placeholder="Categories..."
				class="fields__item"
				:pre_selected="[27]"
			></multi-select>
			<multi-select
				url="/projects"
				name="projects"
				placeholder="Projects..."
				class="fields__item"
			></multi-select>
			<input type="submit" value="Send" class="fields__item">
		</div>
	</form>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import MultiSelect from '@/components/MultiSelect.vue';

export default defineComponent({

	name: 'App',

	components: {
		MultiSelect,
	},

	setup() {
		return {}
	},

});
</script>

<style lang="scss" scoped>
.fields {
	display: flex;
	flex-wrap: wrap;
	margin: -20px 0 0 -20px;

	&__item {
		width: 250px;
		margin: 20px 0 0 20px;
	}
}

.form {
	margin: 40px;
}
</style>

<style lang="scss">
html, body {
	min-height: 100vh;
}

body {
	margin: 0;
	padding: 0;
}
</style>
