<template>
	<div class="form-wrap">
		<div class="title mb-4">Halo!</div>
		<div class="text mb-6">Silahkan memasukkan email dan password yang sudah terdaftar</div>

		<div class="form">
			<transition appear mode="out-in" name="form-fade">
				<SignIn key="signin" />
			</transition>
		</div>
	</div>
</template>

<script lang="ts" setup>
import Logo from "@/app-layouts/common/Logo.vue"
import { useThemeStore } from "@/stores/theme"
import { computed, onBeforeMount, ref } from "vue"
import SignIn from "./SignIn.vue"

export type FormType = "signin" | "signup" | "forgotpassword"

const props = defineProps<{
	type?: FormType
}>()

const typeRef = ref<FormType>("signin")

const themeStore = useThemeStore()

const isDark = computed<boolean>(() => themeStore.isThemeDark)

onBeforeMount(() => {
	if (props.type) {
		typeRef.value = props.type
	}
})
</script>

<style lang="scss" scoped>
.form-wrap {
	width: 100%;
	min-width: 270px;
	max-width: 400px;

	.logo {
		:deep(img) {
			max-height: 37px;
		}
	}
	.title {
		font-size: 36px;
		font-family: var(--font-family-display);
		line-height: 1.2;
		font-weight: 700;
	}
	.text {
		font-size: 18px;
		line-height: 1.3;
		color: var(--fg-secondary-color);
	}

	.social-btns {
		.b-icon {
			margin-right: 16px;

			img {
				display: block;
				height: 20px;
			}
		}
	}
}

.form-fade-enter-active,
.form-fade-leave-active {
	transition:
		opacity 0.2s ease-in-out,
		transform 0.3s ease-in-out;
}
.form-fade-enter-from {
	opacity: 0;
	transform: translateX(10px);
}
.form-fade-leave-to {
	opacity: 0;
	transform: translateX(-10px);
}
</style>
