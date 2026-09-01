<template>
	<div class="page">
		<div v-if="!isLogged" class="flex wrapper justify-center">
			<div class="form-box basis-1/3 flex items-center justify-center" :class="{ centered: align === 'center' }">
				<AuthForm :type="type" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { FormType } from "@/components/AuthForm/index.vue"
import AuthForm from "@/components/AuthForm/index.vue"
import { useAuthStore } from "@/stores/auth"
import { useThemeStore } from "@/stores/theme"
import { computed, onBeforeMount, ref } from "vue"
import { useRoute } from "vue-router"

type Align = "left" | "center" | "right"

const route = useRoute()
const align = ref<Align>("center")
const activeColor = ref("")
const type = ref<FormType | undefined>(undefined)

const themeStore = useThemeStore()
const authStore = useAuthStore()

const primaryColor = computed(() => themeStore.primaryColor)
const isLogged = computed(() => authStore.isLogged)

onBeforeMount(() => {
	if (route.query.step) {
		const step = route.query.step as FormType
		type.value = step
	}
	activeColor.value = primaryColor.value
})
</script>

<style lang="scss" scoped>
@import "@/assets/scss/common.scss";

.page {
	min-height: 100vh;

	.settings {
		position: fixed;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--bg-secondary-color);
		height: 44px;
		width: 300px;
		border-radius: 50px;
		padding: 5px;
		z-index: 1;
	}

	.wrapper {
		min-height: 100vh;

		.image-box {
			background-color: v-bind(activeColor);
			position: relative;

			&::after {
				content: "";
				width: 100%;
				height: 100%;
				position: absolute;
				top: 0;
				left: 0;
				background-image: url(@/assets/images/pattern-onboard.png);
				background-size: 500px;
				background-position: center center;
			}
		}

		.form-box {
			padding: 50px;

			&.centered {
				flex-basis: 100%;
				.form-wrap {
					padding: 60px;
					width: 100%;
					max-width: 500px;
					background-color: var(--bg-color);
					border-radius: 20px;
					@apply shadow-xl;
				}

				@media (max-width: 600px) {
					padding: 4%;
					.form-wrap {
						padding: 8%;
					}
				}
			}
		}
	}
	@media (max-width: 800px) {
		.settings {
			width: 112px;
			.colors {
				display: none;
			}
		}
		.wrapper {
			.image-box {
				display: none;
			}

			.form-box {
				flex-basis: 100%;
			}
		}
	}
}
</style>
