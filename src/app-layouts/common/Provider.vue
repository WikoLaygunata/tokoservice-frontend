<template>
	<n-config-provider preflight-style-disabled :theme="theme" :theme-overrides="themeOverrides">
		<n-loading-bar-provider :container-style="{ height: '3px' }">
			<n-message-provider>
				<n-notification-provider>
					<n-modal-provider>
						<n-dialog-provider>
							<GlobalListener>
								<slot />
							</GlobalListener>
						</n-dialog-provider>
					</n-modal-provider>
				</n-notification-provider>
			</n-message-provider>
		</n-loading-bar-provider>
		<n-global-style />
	</n-config-provider>
</template>

<script lang="ts" setup>
import GlobalListener from "@/app-layouts/common/GlobalListener.vue"
import { useThemeStore } from "@/stores/theme"
import { useWindowSize } from "@vueuse/core"
import {
	NConfigProvider,
	NDialogProvider,
	NGlobalStyle,
	NLoadingBarProvider,
	NMessageProvider,
	NModalProvider,
	NNotificationProvider,
	type GlobalThemeOverrides
} from "naive-ui"
import { computed, onBeforeMount, watch } from "vue"

const { width } = useWindowSize()

const themeStore = useThemeStore()

const theme = computed(() => themeStore.naiveTheme)
const themeOverrides = computed<GlobalThemeOverrides>(() => themeStore.themeOverrides)
const style = computed<CSSStyleDeclaration>(() => themeStore.style)

watch(style, () => {
	setGlobalVars()
})
watch(width, () => {
	themeStore.updateVars()
})

function setGlobalVars() {
	const html = document.children[0] as HTMLElement
	const { style: htmlStyle } = html
	for (const key in style.value) {
		htmlStyle.setProperty(key, style.value[key])
	}
}

onBeforeMount(() => {
	themeStore.updateVars()
	setGlobalVars()
})
</script>
