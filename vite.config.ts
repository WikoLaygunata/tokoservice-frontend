import { fileURLToPath, URL } from "node:url"

import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import Components from "unplugin-vue-components/vite"
import { defineConfig } from "vite"
import svgLoader from "vite-svg-loader"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			script: {
				defineModel: true,
				propsDestructure: true
			}
		}),
		vueJsx(),
		svgLoader(),
		Components({
			dirs: ["src/components/cards"],
			dts: "unplugin.components.d.ts"
		})
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	},
	optimizeDeps: {
		include: ["fast-deep-equal"]
	},
	preview: {
		allowedHosts: ["admin.palapataxiekspedisi.com"]
	}
})
