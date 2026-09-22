import axios from "axios"
import { acceptHMRUpdate, defineStore } from "pinia"

export interface DashboardSummary {
	total_antrean_aktif: number
	selesai_hari_ini: number
	batal_hari_ini: number
	menunggu_diterima: number
	total_semua_tiket: number
}

export interface StatusDistributionItem {
	status: string
	count: number
}

export interface ActivityLogItem {
	id: number
	user_id?: number
	user?: { id: number; name: string; username: string }
	action: string
	description: string
	ip_address?: string
	created_at: string
}

export interface DashboardAnalyticsData {
	summary: DashboardSummary
	status_distribution: StatusDistributionItem[]
	active_queue_breakdown: StatusDistributionItem[]
	recent_activities: ActivityLogItem[]
}

export interface SparepartAnalyticsItem {
	id: number
	name: string
	total_quantity: number
	total_tickets: number
	percentage: number
}

export interface PhoneBrandAnalyticsItem {
	id: number
	name: string
	total_units: number
	percentage: number
}

export interface WorkerAnalyticsItem {
	id: number
	name: string
	phone?: string
	is_active: boolean
	total_assigned: number
	total_completed: number
	total_cancelled: number
	total_in_progress: number
	avg_duration_minutes: number
	success_rate: number
}

export interface CustomerHistoryItem {
	id: number
	name: string
	phone: string
	address?: string
	total_tickets: number
	total_completed: number
	last_service_at: string | null
}

export const useAnalyticsStore = defineStore("analytics", {
	state: () => ({
		dashboard: null as DashboardAnalyticsData | null,
		loadingDashboard: false
	}),
	actions: {
		async fetchDashboard(forceRefresh = false) {
			if (!forceRefresh && this.dashboard) {
				return this.dashboard
			}

			this.loadingDashboard = true
			try {
				const { data } = await axios.get("analytics/dashboard")
				this.dashboard = data.data || data
				return this.dashboard
			} finally {
				this.loadingDashboard = false
			}
		},
		async fetchSpareparts(params?: any) {
			const { data } = await axios.get("analytics/spareparts", { params })
			return data.data || data
		},
		async fetchPhoneBrands(params?: any) {
			const { data } = await axios.get("analytics/phone-brands", { params })
			return data.data || data
		},
		async fetchWorkers(params?: any) {
			const { data } = await axios.get("analytics/workers", { params })
			return data.data || data
		},
		async fetchCustomerHistory(params?: any) {
			const { data } = await axios.get("analytics/customer-history", { params })
			return data.data || data
		},
		async fetchActivityLogs(params?: any) {
			const { data } = await axios.get("activity-logs", { params })
			return data.data || data
		}
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAnalyticsStore, import.meta.hot))
}
