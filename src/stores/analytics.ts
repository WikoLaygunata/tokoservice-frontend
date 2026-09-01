import axios from "axios"
import { acceptHMRUpdate, defineStore } from "pinia"

type AnalyticsDashboard = {
	cards: Record<string, number>
	charts: {
		landing: any[]
	}
}

const initialData: AnalyticsDashboard = {
	cards: {
		user: 0,
		pengurus: 0,
		aktivis: 0,
		artikel: 0
	},
	charts: {
		landing: []
	}
}

export const useAnalyticsStore = defineStore("analytics", {
	state: () => ({
		dashboard: initialData as AnalyticsDashboard,
		loaded: false
	}),
	actions: {
		async ensureDashboard(forceRefresh = false) {
			if (!forceRefresh && this.loaded) return this.dashboard

			const { data } = await axios.get("analytics/dashboard")
			this.dashboard = {
				cards: data.cards || this.dashboard.cards,
				charts: data.charts || this.dashboard.charts
			}
			this.loaded = true
			return this.dashboard
		},
		clearDashboardCache() {
			this.dashboard = initialData
			this.loaded = false
		}
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAnalyticsStore, import.meta.hot))
}
