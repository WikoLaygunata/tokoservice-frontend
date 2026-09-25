import axios from "axios"
import { acceptHMRUpdate, defineStore } from "pinia"

function unwrapAnalyticsResponse<T extends Record<string, any>>(payload: T): T {
	return payload.data && !Array.isArray(payload.data) ? payload.data : payload
}

type AnalyticsParams = Record<string, any> | undefined
type AnalyticsResponse = Record<string, any>

function cacheKey(params: AnalyticsParams) {
	return JSON.stringify(params || {})
}

const analyticsCache = {
	spareparts: new Map<string, AnalyticsResponse>(),
	phoneBrands: new Map<string, AnalyticsResponse>(),
	workers: new Map<string, AnalyticsResponse>(),
	customerHistory: new Map<string, AnalyticsResponse>(),
	activityLogs: new Map<string, AnalyticsResponse>()
}

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
	user_name?: string
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
		async fetchSpareparts(params?: AnalyticsParams, forceRefresh = false) {
			const key = cacheKey(params)
			if (!forceRefresh && analyticsCache.spareparts.has(key)) {
				return analyticsCache.spareparts.get(key)!
			}
			const { data } = await axios.get("analytics/spareparts", { params })
			const result = unwrapAnalyticsResponse(data)
			analyticsCache.spareparts.set(key, result)
			return result
		},
		async fetchPhoneBrands(params?: AnalyticsParams, forceRefresh = false) {
			const key = cacheKey(params)
			if (!forceRefresh && analyticsCache.phoneBrands.has(key)) {
				return analyticsCache.phoneBrands.get(key)!
			}
			const { data } = await axios.get("analytics/phone-brands", { params })
			const result = unwrapAnalyticsResponse(data)
			analyticsCache.phoneBrands.set(key, result)
			return result
		},
		async fetchWorkers(params?: AnalyticsParams, forceRefresh = false) {
			const key = cacheKey(params)
			if (!forceRefresh && analyticsCache.workers.has(key)) {
				return analyticsCache.workers.get(key)!
			}
			const { data } = await axios.get("analytics/workers", { params })
			const result = unwrapAnalyticsResponse(data)
			analyticsCache.workers.set(key, result)
			return result
		},
		async fetchCustomerHistory(params?: AnalyticsParams, forceRefresh = false) {
			const key = cacheKey(params)
			if (!forceRefresh && analyticsCache.customerHistory.has(key)) {
				return analyticsCache.customerHistory.get(key)!
			}
			const { data } = await axios.get("analytics/customer-history", { params })
			const result = unwrapAnalyticsResponse(data)
			analyticsCache.customerHistory.set(key, result)
			return result
		},
		async fetchActivityLogs(params?: AnalyticsParams, forceRefresh = false) {
			const key = cacheKey(params)
			if (!forceRefresh && analyticsCache.activityLogs.has(key)) {
				return analyticsCache.activityLogs.get(key)!
			}
			const { data } = await axios.get("activity-logs", { params })
			const result = data.current_page !== undefined ? data : data.data || data
			analyticsCache.activityLogs.set(key, result)
			return result
		}
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAnalyticsStore, import.meta.hot))
}
