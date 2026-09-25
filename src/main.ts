const meta = document.createElement("meta")
meta.name = "naive-ui-style"
document.head.appendChild(meta)

import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { createApp } from "vue"
import { createI18n } from "vue-i18n"
import "@fontsource/jetbrains-mono/latin.css"
import "@fontsource/lexend/latin.css"
import "@fontsource/public-sans/latin.css"

import App from "@/App.vue"
import { type Locales, type MessageSchema, getI18NConf } from "@/lang/config"
import router from "@/router"

import { useAuthStore } from "@/stores/auth"
import axios from "axios"
import { nextTick } from "vue"

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const i18n = createI18n<MessageSchema, Locales>(getI18NConf())

const app = createApp(App)
app.use(pinia)
app.use(i18n)
app.use(router)

app.mount("#app")

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL + "/api"

const authStore = useAuthStore()

if (import.meta.env.PROD && "serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(error => {
			console.error("Gagal mendaftarkan service worker:", error)
		})
	})
}

axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`

nextTick(async () => {
	// Wait for the router to be ready (in case of any asynchronous routing)
	await router.isReady()

	// if response status is 401, and route is not login, redirect to login
	axios.interceptors.response.use(
		response => response,
		error => {
			if (error.response.status === 401 && router.currentRoute.value.name !== "Login") {
				authStore.setLogout()
				router.push({ name: "Login" })
			}

			return Promise.reject(error)
		}
	)

	// axios.get("/auth/me").then(response => {
	// 	authStore.user = response.data
	// 	authStore.role = response.data.role.name
	// })
})