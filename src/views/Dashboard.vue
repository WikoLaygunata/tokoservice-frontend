<template>
	<div class="space-y-6">
		<!-- Welcome & Header Banner -->
		<div class="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 shadow-lg">
			<div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span class="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
							● Workshop Meja Servis Aktif
						</span>
						<span class="text-xs font-mono text-slate-400">{{ todayFormatted }}</span>
					</div>
					<h1 class="text-2xl font-black tracking-tight text-white md:text-3xl">
						Selamat Datang, {{ authUser?.name || "Teknisi" }}!
					</h1>
					<p class="text-xs text-slate-300 md:text-sm max-w-2xl">
						Sistem Technical Tracking & Operational Workshop Toko Servis Smartphone. Pantau antrean aktif meja teknisi dan rekam jejak pengerjaan secara real-time.
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<n-button type="primary" size="medium" @click="$router.push({ name: 'ServiceTickets' })">
						<template #icon><Icon name="tabler:layout-kanban" :size="18" /></template>
						Buka Meja Kerja
					</n-button>
					<n-button secondary size="medium" :loading="loading" @click="fetchDashboardData(true)">
						<template #icon><Icon name="tabler:refresh" :size="18" /></template>
						Refresh Data
					</n-button>
				</div>
			</div>
		</div>

		<!-- 4 Top Summary Metric Cards -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<!-- Card 1: Antrean Aktif -->
			<div class="group relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 p-5 shadow-sm transition hover:border-blue-500/60 hover:shadow-md">
				<div class="flex items-start justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-blue-300">Antrean Aktif Meja Kerja</span>
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
						<Icon name="tabler:clock-hour-4" :size="20" />
					</div>
				</div>
				<div class="mt-3 flex items-baseline gap-2">
					<span class="text-3xl font-black tracking-tight text-white font-mono">
						{{ summaryData.total_antrean_aktif }}
					</span>
					<span class="text-xs text-slate-400">Unit Sedang Diproses</span>
				</div>
				<div class="mt-2 text-[11px] text-blue-300/80">
					Diterima, Diagnosis, Menunggu Part, Pengerjaan
				</div>
			</div>

			<!-- Card 2: Selesai Hari Ini -->
			<div class="group relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-5 shadow-sm transition hover:border-emerald-500/60 hover:shadow-md">
				<div class="flex items-start justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Selesai Hari Ini</span>
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
						<Icon name="tabler:circle-check" :size="20" />
					</div>
				</div>
				<div class="mt-3 flex items-baseline gap-2">
					<span class="text-3xl font-black tracking-tight text-white font-mono">
						{{ summaryData.selesai_hari_ini }}
					</span>
					<span class="text-xs text-slate-400">Unit Siap / Diserahkan</span>
				</div>
				<div class="mt-2 text-[11px] text-emerald-300/80">
					Total selesai dikerjakan teknisi hari ini
				</div>
			</div>

			<!-- Card 3: Menunggu Diterima -->
			<div class="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-5 shadow-sm transition hover:border-amber-500/60 hover:shadow-md">
				<div class="flex items-start justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-amber-300">Menunggu Pengambilan</span>
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
						<Icon name="tabler:device-mobile-check" :size="20" />
					</div>
				</div>
				<div class="mt-3 flex items-baseline gap-2">
					<span class="text-3xl font-black tracking-tight text-white font-mono">
						{{ summaryData.menunggu_diterima }}
					</span>
					<span class="text-xs text-slate-400">Unit Menunggu Customer</span>
				</div>
				<div class="mt-2 text-[11px] text-amber-300/80">
					Pengerjaan selesai, siap diambil pelanggan
				</div>
			</div>

			<!-- Card 4: Batal Hari Ini -->
			<div class="group relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 p-5 shadow-sm transition hover:border-rose-500/60 hover:shadow-md">
				<div class="flex items-start justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-rose-300">Batal Hari Ini</span>
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
						<Icon name="tabler:circle-x" :size="20" />
					</div>
				</div>
				<div class="mt-3 flex items-baseline gap-2">
					<span class="text-3xl font-black tracking-tight text-white font-mono">
						{{ summaryData.batal_hari_ini }}
					</span>
					<span class="text-xs text-slate-400">Unit Dibatalkan</span>
				</div>
				<div class="mt-2 text-[11px] text-rose-300/80">
					Unit batal servis / sparepart tidak tersedia
				</div>
			</div>
		</div>

		<!-- Middle Section: Active Queue Breakdown & Quick Shortcuts -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Active Queue Stage Breakdown -->
			<n-card class="rounded-xl border border-slate-700/60 shadow-sm lg:col-span-2" title="Distribusi Antrean Aktif Meja Teknisi">
				<div class="space-y-4">
					<div
						v-for="stage in activeStagesList"
						:key="stage.name"
						class="space-y-1.5 rounded-lg border border-slate-700/40 bg-slate-800/40 p-3"
					>
						<div class="flex items-center justify-between text-xs">
							<div class="flex items-center gap-2">
								<span class="h-2 w-2 rounded-full" :style="{ backgroundColor: stage.color }"></span>
								<span class="font-bold text-slate-200">{{ stage.name }}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="font-mono font-bold text-white text-sm">{{ stage.count }} Unit</span>
								<span class="text-[10px] text-slate-400">({{ stage.percentage }}%)</span>
							</div>
						</div>

						<div class="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
							<div
								class="h-full rounded-full transition-all duration-500"
								:style="{
									width: `${stage.percentage}%`,
									backgroundColor: stage.color
								}"
							></div>
						</div>
					</div>
				</div>
			</n-card>

			<!-- Quick Actions & Status Summary -->
			<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Akses Cepat & Navigasi">
				<div class="space-y-3">
					<router-link
						:to="{ name: 'ServiceTickets' }"
						class="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 p-3.5 transition hover:border-indigo-500 hover:bg-slate-800 hover:shadow"
					>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
								<Icon name="tabler:tool" :size="20" />
							</div>
							<div>
								<div class="text-xs font-bold text-slate-100">Meja Kerja Servis HP</div>
								<div class="text-[11px] text-slate-400">Kanban Board & Riwayat Tiket</div>
							</div>
						</div>
						<Icon name="tabler:chevron-right" :size="16" color="#64748b" />
					</router-link>

					<router-link
						:to="{ name: 'Masterdata-Customer' }"
						class="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 p-3.5 transition hover:border-sky-500 hover:bg-slate-800 hover:shadow"
					>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
								<Icon name="tabler:users" :size="20" />
							</div>
							<div>
								<div class="text-xs font-bold text-slate-100">Daftar Pelanggan</div>
								<div class="text-[11px] text-slate-400">Kontak WhatsApp & Alamat</div>
							</div>
						</div>
						<Icon name="tabler:chevron-right" :size="16" color="#64748b" />
					</router-link>

					<router-link
						:to="{ name: 'Analytics' }"
						class="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/60 p-3.5 transition hover:border-emerald-500 hover:bg-slate-800 hover:shadow"
					>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
								<Icon name="tabler:chart-bar" :size="20" />
							</div>
							<div>
								<div class="text-xs font-bold text-slate-100">Laporan & Analitik</div>
								<div class="text-[11px] text-slate-400">Ranking Sparepart & Kinerja Teknisi</div>
							</div>
						</div>
						<Icon name="tabler:chevron-right" :size="16" color="#64748b" />
					</router-link>
				</div>
			</n-card>
		</div>

		<!-- Bottom Section: Recent Activity Logs Feed -->
		<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Log Aktivitas Terbaru (Audit Trail)">
			<div v-if="recentActivities.length === 0" class="py-8 text-center text-xs text-slate-400">
				Belum ada aktivitas tercatat.
			</div>

			<div v-else class="space-y-2.5">
				<div
					v-for="act in recentActivities"
					:key="act.id"
					class="flex items-start justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3"
				>
					<div class="flex items-start gap-3">
						<div class="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
							<Icon name="tabler:activity" :size="15" />
						</div>
						<div>
							<div class="text-xs font-bold text-slate-200">
								{{ act.user?.name || "Sistem" }}
								<span class="ml-1 rounded bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
									{{ act.action }}
								</span>
							</div>
							<div class="text-xs text-slate-300 mt-0.5">{{ act.description }}</div>
						</div>
					</div>

					<div class="text-right text-[11px] font-mono text-slate-400 whitespace-nowrap">
						{{ formatRelativeTime(act.created_at) }}
					</div>
				</div>
			</div>
		</n-card>
	</div>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import { useAuthStore } from "@/stores/auth"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { NButton, NCard, useMessage } from "naive-ui"
import { computed, onMounted, ref } from "vue"

dayjs.extend(relativeTime)

const message = useMessage()
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()

const loading = ref(false)

const authUser = computed(() => authStore.user)
const todayFormatted = computed(() => dayjs().format("dddd, DD MMMM YYYY"))

const dashboard = computed(() => analyticsStore.dashboard)

const summaryData = computed(() => {
	return {
		total_antrean_aktif: dashboard.value?.summary?.total_antrean_aktif ?? 0,
		selesai_hari_ini: dashboard.value?.summary?.selesai_hari_ini ?? 0,
		batal_hari_ini: dashboard.value?.summary?.batal_hari_ini ?? 0,
		menunggu_diterima: dashboard.value?.summary?.menunggu_diterima ?? 0,
		total_semua_tiket: dashboard.value?.summary?.total_semua_tiket ?? 0
	}
})

const stageColorMap: Record<string, string> = {
	"Diterima": "#3b82f6",
	"Diagnosis": "#a855f7",
	"Menunggu Part": "#f59e0b",
	"Pengerjaan": "#06b6d4",
	"Menunggu Diterima": "#f97316"
}

const activeStagesList = computed(() => {
	const total = summaryData.value.total_antrean_aktif || 1
	const stages = ["Diterima", "Diagnosis", "Menunggu Part", "Pengerjaan", "Menunggu Diterima"]
	const rawList = dashboard.value?.active_queue_breakdown || []

	return stages.map(stName => {
		const found = rawList.find((item: any) => item.status === stName)
		const count = found ? Number(found.count) : 0
		const percentage = summaryData.value.total_antrean_aktif > 0
			? Math.round((count / total) * 100)
			: 0

		return {
			name: stName,
			count,
			percentage,
			color: stageColorMap[stName] || "#94a3b8"
		}
	})
})

const recentActivities = computed(() => {
	return dashboard.value?.recent_activities || []
})

const formatRelativeTime = (timeStr?: string) => {
	if (!timeStr) return "-"
	return dayjs(timeStr).fromNow()
}

const fetchDashboardData = async (forceRefresh = false) => {
	loading.value = true
	try {
		await analyticsStore.fetchDashboard(forceRefresh)
	} catch (err: any) {
		message.error(err.response?.data?.message || err.message || "Gagal memuat dashboard")
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchDashboardData()
})
</script>
