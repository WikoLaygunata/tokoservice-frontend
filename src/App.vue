<template>
	<Provider>
		<component :is="layoutComponent" :class="[`theme-${themeName}`, `layout-${layout}`, themeName]">
			<RouterView v-slot="{ Component }">
				<transition appear mode="out-in" :name="`router-${routerTransition}`">
					<component
						:is="Component"
						:key="forceRefresh"
						:class="[`theme-${themeName}`, `layout-${layout}`, themeName]"
					/>
				</transition>
			</RouterView>
		</component>

		<SplashScreen :loading="loading" />
		<SearchDialog v-if="isLogged" />
		<LayoutSettings />
	</Provider>
</template>

<script lang="ts" setup>
import Blank from "@/app-layouts/Blank/index.vue"
import Empty from "@/app-layouts/Empty/index.vue"
import HorizontalNav from "@/app-layouts/HorizontalNav/index.vue"
import VerticalNav from "@/app-layouts/VerticalNav/index.vue"
import Provider from "@/app-layouts/common/Provider.vue"
import SplashScreen from "@/app-layouts/common/SplashScreen.vue"
import "@/assets/scss/index.scss"
import LayoutSettings from "@/components/common/LayoutSettings.vue"
import SearchDialog from "@/components/common/SearchDialog.vue"
import { useAuthStore } from "@/stores/auth"
import { useMainStore } from "@/stores/main"
import { useThemeStore } from "@/stores/theme"
import { Layout, RouterTransition, type ThemeName } from "@/types/theme.d"
import { computed, onBeforeMount, onMounted, onUnmounted, ref, type Component } from "vue"
import { useRoute, useRouter, type RouteLocationNormalized } from "vue-router"

const router = useRouter()
const loading = ref(true)

const layoutComponents = {
	VerticalNav,
	HorizontalNav,
	Blank,
	Empty
}

const themeStore = useThemeStore()
const mainStore = useMainStore()
const authStore = useAuthStore()

const forceLayout = ref<Layout | null>(null)
const forceRefresh = computed<number>(() => mainStore.forceRefresh)
const layout = computed<Layout>(() => themeStore.layout)
const layoutComponent = computed<Component>(() => layoutComponents[forceLayout.value || layout.value])
const routerTransition = computed<RouterTransition>(() => themeStore.routerTransition)
const themeName = computed<ThemeName>(() => themeStore.themeName)
const isLogged = computed(() => authStore.isLogged)

const maxHeight = ref("")

function checkForcedLayout(route: RouteLocationNormalized) {
	if (route.meta?.forceLayout) {
		forceLayout.value = route.meta.forceLayout
	} else {
		forceLayout.value = null
	}
}

router.beforeEach(route => {
	checkForcedLayout(route)
})

onBeforeMount(() => {
	checkForcedLayout(useRoute())

	setTimeout(() => {
		loading.value = false
	}, 500)
})

onMounted(() => {
	const updateMaxHeight = () => {
		const availableHeight = window.innerHeight - 250 // Adjust 250 to your desired offset
		maxHeight.value = `${availableHeight}px`
	}

	updateMaxHeight()
	window.addEventListener("resize", updateMaxHeight)

	// Cleanup on unmount
	onUnmounted(() => {
		window.removeEventListener("resize", updateMaxHeight)
	})
})
</script>
