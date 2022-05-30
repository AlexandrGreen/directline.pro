<template>
	<div
		v-click-outside="dropdown_close()"
		class="multiselect"
	>
		<div
			v-if="url_sanitized.length"
			class="multiselect__input input"
			@click="dropdown_open()"
		>
			<div
				v-if="selected_options.length"
				class="input__values"
			>{{ selected_options_titles }}
			</div>
			<div
				v-else
				class="input__placeholder"
			>{{ placeholder }}
			</div>
			<div
				v-if="selected_options.length"
				class="input__clear"
				@click="unselect_all()"
			>X
			</div>
		</div>
		<div
			v-if="dropdown_opened"
			class="multiselect__dropdown dropdown"
		>
			<div class="dropdown__panel">
				<div
					@click="select_all()"
					class="dropdown__select-all"
				>Выбрать все</div>
				<input
					type="text"
					class="dropdown__search"
					placeholder="Поиск: ..."
					v-model="request_search"
				>
			</div>
			<div class="dropdown__items">
				<div
					v-for="option in options"
					class="dropdown__item"
					:class="{dropdown__item_selected: selected_options_ids.includes(option.id)}"
					@click="select_option(option)"
				>{{ option.title }}
				</div>
			</div>
		</div>
		<div class="multiselect__hidden">
			<select :name="name + '[]'" multiple>
				<option
					v-for="selected_options_id in selected_options_ids"
					:value="selected_options_id"
					selected
				></option>
			</select>
		</div>
	</div>
</template>

<!--<script lang="ts">-->
<script>
import api from '@/http';
import {defineComponent, PropType, ref, computed, onMounted, onUnmounted, watch} from 'vue';

/*interface IOption {
	id: Number,
}*/

export default defineComponent({

	name: 'MultiSelect',

	props: {
		url: {
			type: String,
			required: true,
			default: '',
		},
		name: {
			type: String,
			default: '',
		},
		placeholder: {
			type: String,
			default: '',
		},
		pre_selected: {
			type: Array,
			default: [],
			// type: Array as PropType<Array<IOption>>,
		},
	},

	setup(props) {
		const url_sanitized = computed(
			() => props.url.match(/^\/[/.a-zA-Z0-9-_]+$/i) !== null
				? props.url.toLowerCase()
				: '',
			),
			values = ref([]),
			options = ref([]),
			request_limit = 50,
			request_offset = computed(() => options.value.length),
			request_search = ref(''),
			exist_options_count = ref(0),
			get_options_request = () => {
				return new Promise(resolve => {
					let post = {
						limit: request_limit,
						offset: request_offset.value,
					};
					if (request_search.value.length) {
						post.search = request_search.value;
					}
					api
						.post(
							url_sanitized.value,
							post
						)
						.then(response => {
							if (
								response.status === 200
								&& response.data.code
								&& response.data.code === 200
								&& response.data.message
							) {
								options.value = options.value.concat(response.data.message.data);
								exist_options_count.value = response.data.message.total;
								resolve();
							}
						});
				});
			},
			get_options = async () => {
				do {
					await get_options_request();
				} while (options.value.length < exist_options_count.value);
			},
			dropdown_opened = ref(false),
			dropdown_open = () => {
				dropdown_opened.value = true;
			},
			dropdown_close = () => () => {
				dropdown_opened.value = false;
			},
			search_input_min = 2,
			search_input_waiter = ref(null),
			start_waiter_timer = () => {
				clearTimeout(search_input_waiter.value);
				search_input_waiter.value = setTimeout(() => {
					get_options();
				}, 1500);
			},
			selected_options = ref([]),
			selected_options_ids = computed(() => selected_options.value.map(option => option.id)),
			selected_options_titles = computed(() => selected_options.value
				.map(option => option.title)
				.join(', ')
			),
			select_all = () => {
				selected_options.value = selected_options.value.concat(
					options.value.filter(option => !selected_options_ids.value.includes(option.id))
				);
			},
			unselect_all = () => {
				selected_options.value = [];
			},
			select_option = option => {
				if (selected_options_ids.value.includes(option.id)) {
					selected_options.value.splice(
						selected_options.value.indexOf(
							selected_options.value.find(selected_option => selected_option.id === option.id)
						),
						1
					);
				} else {
					selected_options.value.push(option);
				}
			};

		onMounted(() => {
			if (url_sanitized.value.length) {
				get_options();
			}
		});

		watch(
			() => request_search.value,
			v => {
				if (v.length >= search_input_min) {
					options.value = [];
					start_waiter_timer();
				}
			}
		);

		return {
			url_sanitized,
			values,
			options,
			exist_options_count,
			dropdown_opened,
			dropdown_open,
			dropdown_close,
			request_search,
			select_option,
			select_all,
			unselect_all,
			selected_options,
			selected_options_ids,
			selected_options_titles,
		}
	},

	directives: {
		clickOutside: {
			mounted: (el, binding) => {
				el.click_outside_event = event => {
					if (!(el === event.target || el.contains(event.target))) {
						binding.value();
					}
				};
				document.body.addEventListener('click', el.click_outside_event);
			},
			unmounted: el => {
				document.body.removeEventListener('click', el.click_outside_event);
			},
		},
	},

});
</script>

<style lang="scss" scoped>
$height: 25px;

.multiselect {
	position: relative;

	&, & * {
		box-sizing: border-box;
	}

	&__dropdown {
		left: 0;
		width: 100%;
		overflow: auto;
		max-height: 50vh;
		top: $height + 1px;
		position: absolute;
	}

	&__hidden {
		display: none;
	}
}

.input {
	height: $height;
	display: flex;
	position: relative;
	border-radius: 3px;
	align-items: center;
	padding: 0 45px 0 15px;
	border: 1px solid #333333;

	&__clear {
		right: 15px;
		width: 15px;
		height: 15px;
		display: flex;
		color: #d8093a;
		line-height: 1;
		cursor: pointer;
		font-size: 12px;
		font-weight: 700;
		border-radius: 50%;
		position: absolute;
		align-items: center;
		justify-content: center;

		&:hover {
			background-color: #eaeaea;
		}
	}

	&__values {
		overflow: hidden;
		white-space: nowrap;
	}
}

.dropdown {
	padding: 5px 0;
	border-radius: 3px;
	border: 1px solid #333333;

	&__items {
	}

	&__item {
		height: 20px;
		display: flex;
		cursor: pointer;
		padding: 0 15px;
		user-select: none;
		align-items: center;

		&:nth-child(n+2) {
			margin-top: 2px;
		}

		&:hover {
			background-color: #eaeaea;
		}

		&_selected {
			display: flex;
			position: relative;
			align-items: center;

			&:before {
				left: 5px;
				content: '';
				width: 5px;
				height: 5px;
				display: block;
				border-radius: 50%;
				position: absolute;
				background-color: #429939;
			}
		}
	}

	&__panel {
		width: 100%;
		display: flex;
		padding: 0 15px;
		margin-bottom: 5px;
		align-items: center;
		justify-content: space-between;
	}

	&__select-all {
		width: 70px;
		flex-shrink: 0;
		font-size: 12px;
		cursor: pointer;
	}

	&__search {
		outline: 0;
		height: 20px;
		max-width: 80%;
		font-size: 12px;
		padding: 0 10px;
		margin-left: 15px;
		border-radius: 3px;
		width: calc(100% - 85px);
		border: 1px solid #333333;
	}
}
</style>
