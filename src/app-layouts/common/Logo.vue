<template>
	<div v-if="isDark && !mini" class="logo">
		<img src="@/assets/images/brand-logo.png" />
	</div>
	<div v-else-if="isLight && !mini" class="logo">
		<img src="@/assets/images/brand-logo.png" />
	</div>
	<div v-else-if="isDark && mini" class="logo">
		<img src="@/assets/images/brand-icon.png" />
	</div>
	<div v-else-if="isLight && mini" class="logo">
		<img src="@/assets/images/brand-icon.png" />
	</div>
</template>

<script lang="ts" setup>
import { useThemeStore } from "@/stores/theme"
import { computed, toRefs } from "vue"

defineOptions({
	name: "Logo"
})

const props = withDefaults(
	defineProps<{
		mini: boolean
		dark?: boolean
	}>(),
	{ dark: undefined }
)
const { mini, dark } = toRefs(props)

const themeStore = useThemeStore()

const isDark = computed<boolean>(() => dark.value ?? themeStore.isThemeDark)
const isLight = computed<boolean>(() => !dark.value || themeStore.isThemeLight)
</script>

<style lang="scss" scoped>
.logo {
	height: 100%;
	display: flex;
	align-items: center;

	img {
		max-height: 32px;
		display: block;
		height: 100%;
	}

	&.fade-enter-active,
	&.fade-leave-active {
		transition: opacity var(--sidebar-anim-ease) var(--sidebar-anim-duration);
	}

	&.fade-enter-from,
	&.fade-leave-to {
		opacity: 0;
	}
}
</style>
