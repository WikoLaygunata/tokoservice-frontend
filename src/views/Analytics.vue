<template>
	<div class="space-y-4">
		<!-- Analytics Header & Filter Bar -->
		<n-card class="rounded-xl border border-slate-700/60 shadow-sm">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
						<Icon name="tabler:chart-bar" :size="24" />
					</div>
					<div>
						<h1 class="text-xl font-black tracking-tight text-slate-100">
							Laporan & Analitik Workshop Servis
						</h1>
						<p class="text-xs text-slate-400">
							Evaluasi penggunaan sparepart, tren merek smartphone, efisiensi teknisi, dan rekap pelanggan.
						</p>
					</div>
				</div>

				<!-- Date Preset Filter -->
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-xs font-semibold text-slate-400">Filter Periode:</span>
					<n-radio-group v-model:value="datePreset" size="small" @update:value="onPresetChange">
						<n-radio-button value="this_month">Bulan Ini</n-radio-button>
						<n-radio-button value="last_month">Bulan Lalu</n-radio-button>
						<n-radio-button value="3_months">3 Bulan</n-radio-button>
						<n-radio-button value="6_months">6 Bulan</n-radio-button>
						<n-radio-button value="ytd">YTD</n-radio-button>
						<n-radio-button value="1_year">1 Tahun</n-radio-button>
						<n-radio-button value="">Semua</n-radio-button>
					</n-radio-group>
					<n-button secondary size="small" :loading="loading" @click="fetchAllAnalytics">
						<template #icon><Icon name="tabler:refresh" :size="16" /></template>
					</n-button>
				</div>
			</div>
		</n-card>

		<!-- Analytics Tabs -->
		<n-tabs v-model:value="activeTab" type="segment" animated>
			<!-- TAB 1: Sparepart & Kategori Servis -->
			<n-tab-pane name="spareparts" :tab="renderTab('tabler:cpu', 'Penggunaan Sparepart')">
				<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Ranking Penggunaan Sparepart & Jasa Servis">
					<n-spin :show="loading">
						<div v-if="sparepartsData.length === 0" class="py-12 text-center text-xs text-slate-400">
							Belum ada data penggunaan sparepart pada periode ini.
						</div>

						<div v-else class="space-y-4">
							<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
								<div class="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
									<div class="text-xs text-slate-400">Total Kategori Digunakan</div>
									<div class="text-2xl font-black font-mono text-white mt-1">{{ totalCategoriesUsed }}</div>
								</div>
								<div class="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
									<div class="text-xs text-slate-400">Total Kuantitas (Qty) Terpakai</div>
									<div class="text-2xl font-black font-mono text-emerald-400 mt-1">{{ totalQuantitySum }} Pcs</div>
								</div>
								<div class="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
									<div class="text-xs text-slate-400">Rekomendasi Restock Teratas</div>
									<div class="text-base font-bold text-sky-400 mt-1 truncate">
										{{ sparepartsData[0]?.name || "-" }}
									</div>
								</div>
							</div>

							<n-data-table
								:columns="sparepartColumns"
								:data="sparepartsData"
								:single-column="true"
								:single-line="false"
								size="small"
							/>
						</div>
					</n-spin>
				</n-card>
			</n-tab-pane>

			<!-- TAB 2: Distribusi Merek HP -->
			<n-tab-pane name="brands" :tab="renderTab('tabler:device-mobile', 'Distribusi Merek HP')">
				<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Pangsa Pasar Merek Smartphone Masuk Servis">
					<n-spin :show="loading">
						<div v-if="phoneBrandsData.length === 0" class="py-12 text-center text-xs text-slate-400">
							Belum ada data merek smartphone pada periode ini.
						</div>

						<div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<!-- Visual Progress Bars -->
							<div class="space-y-4 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
								<h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
									Persentase Per Merek (Total: {{ totalBrandUnitsSum }} Unit)
								</h3>

								<div v-for="b in phoneBrandsData" :key="b.id" class="space-y-1.5">
									<div class="flex items-center justify-between text-xs">
										<span class="font-bold text-slate-100">{{ b.name }}</span>
										<div class="flex items-center gap-2">
											<span class="font-mono font-bold text-sky-300">{{ b.total_units }} Unit</span>
											<span class="text-slate-400 font-mono text-[11px]">({{ b.percentage }}%)</span>
										</div>
									</div>
									<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60">
										<div
											class="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
											:style="{ width: `${b.percentage}%` }"
										></div>
									</div>
								</div>
							</div>

							<!-- Table summary -->
							<div>
								<n-data-table
									:columns="brandColumns"
									:data="phoneBrandsData"
									:single-column="true"
									:single-line="false"
									size="small"
								/>
							</div>
						</div>
					</n-spin>
				</n-card>
			</n-tab-pane>

			<!-- TAB 3: Kinerja Teknisi -->
			<n-tab-pane name="workers" :tab="renderTab('tabler:user-check', 'Performa Teknisi')">
				<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Matriks Performa & Efisiensi Pengerjaan Teknisi">
					<n-spin :show="loading">
						<div v-if="workersData.length === 0" class="py-12 text-center text-xs text-slate-400">
							Belum ada data pengerjaan teknisi pada periode ini.
						</div>

						<div v-else class="space-y-4">
							<n-data-table
								:columns="workerColumns"
								:data="workersData"
								:single-column="true"
								:single-line="false"
								size="small"
							/>
						</div>
					</n-spin>
				</n-card>
			</n-tab-pane>

			<!-- TAB 4: Histori Pelanggan -->
			<n-tab-pane name="customers" :tab="renderTab('tabler:users', 'Histori Pelanggan')">
				<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Rekap Kunjungan & Loyalitas Pelanggan">
					<div class="mb-4 max-w-sm">
						<n-input
							v-model:value="customerSearch"
							clearable
							placeholder="Cari pelanggan..."
							@update:value="onCustomerSearch"
						>
							<template #prefix><Icon name="carbon:search" /></template>
						</n-input>
					</div>

					<n-spin :show="loading">
						<n-data-table
							:columns="customerColumns"
							:data="customerHistoryData"
							:single-column="true"
							:single-line="false"
							size="small"
						/>
					</n-spin>
				</n-card>
			</n-tab-pane>

			<!-- TAB 5: Audit Trail Activity Logs -->
			<n-tab-pane name="logs" :tab="renderTab('tabler:activity', 'Audit Trail')">
				<n-card class="rounded-xl border border-slate-700/60 shadow-sm" title="Rekam Jejak Aktivitas Pengguna (Audit Trail Log)">
					<n-spin :show="loading">
						<n-data-table
							:columns="logColumns"
							:data="activityLogsData"
							:single-column="true"
							:single-line="false"
							size="small"
						/>
					</n-spin>
				</n-card>
			</n-tab-pane>
		</n-tabs>
	</div>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import dayjs from "dayjs"
import { debounce } from "lodash"
import {
	NButton,
	NCard,
	NDataTable,
	NInput,
	NRadioButton,
	NRadioGroup,
	NSpin,
	NTabPane,
	NTabs,
	NTag,
	useMessage,
	type DataTableColumns
} from "naive-ui"
import { h, onMounted, ref } from "vue"

const message = useMessage()
const analyticsStore = useAnalyticsStore()

const loading = ref(false)
const activeTab = ref("spareparts")
const datePreset = ref("this_month")
const customerSearch = ref("")

const sparepartsData = ref<any[]>([])
const totalCategoriesUsed = ref(0)
const totalQuantitySum = ref(0)

const phoneBrandsData = ref<any[]>([])
const totalBrandUnitsSum = ref(0)

const workersData = ref<any[]>([])
const customerHistoryData = ref<any[]>([])
const activityLogsData = ref<any[]>([])

const renderTab = (icon: string, label: string) => () =>
	h("div", { class: "flex items-center gap-2" }, [
		h(Icon, { name: icon, size: 16 }),
		h("span", label)
	])

// Columns for Spareparts
const sparepartColumns: DataTableColumns<any> = [
	{
		title: "No",
		key: "idx",
		width: 50,
		align: "center",
		render: (_, index) => index + 1
	},
	{
		title: "Nama Sparepart / Kategori Jasa",
		key: "name",
		width: 250,
		render(row) {
			return h("span", { class: "font-bold text-slate-100" }, row.name)
		}
	},
	{
		title: "Total Qty Terpakai",
		key: "total_quantity",
		align: "center",
		width: 140,
		render(row) {
			return h("span", { class: "font-mono font-bold text-emerald-400 text-sm" }, `${row.total_quantity} Pcs`)
		}
	},
	{
		title: "Total Tiket",
		key: "total_tickets",
		align: "center",
		width: 120,
		render(row) {
			return h("span", { class: "font-mono text-slate-300" }, `${row.total_tickets} Tiket`)
		}
	},
	{
		title: "Pangsa Penggunaan (%)",
		key: "percentage",
		width: 200,
		render(row) {
			return h("div", { class: "space-y-1" }, [
				h("div", { class: "flex justify-between text-xs font-mono font-semibold" }, [
					h("span", `${row.percentage}%`)
				]),
				h("div", { class: "h-2 w-full bg-slate-700 rounded-full overflow-hidden" }, [
					h("div", {
						class: "h-full bg-emerald-500 rounded-full",
						style: { width: `${row.percentage}%` }
					})
				])
			])
		}
	}
]

// Columns for Phone Brands
const brandColumns: DataTableColumns<any> = [
	{
		title: "No",
		key: "idx",
		width: 50,
		align: "center",
		render: (_, index) => index + 1
	},
	{
		title: "Merek HP",
		key: "name",
		render(row) {
			return h("span", { class: "font-bold text-slate-100" }, row.name)
		}
	},
	{
		title: "Total Unit Masuk",
		key: "total_units",
		align: "center",
		width: 140,
		render(row) {
			return h("span", { class: "font-mono font-bold text-sky-400" }, `${row.total_units} Unit`)
		}
	},
	{
		title: "Persentase",
		key: "percentage",
		align: "center",
		width: 120,
		render(row) {
			return h("span", { class: "font-mono font-semibold text-slate-200" }, `${row.percentage}%`)
		}
	}
]

// Columns for Workers
const workerColumns: DataTableColumns<any> = [
	{
		title: "No",
		key: "idx",
		width: 50,
		align: "center",
		render: (_, index) => index + 1
	},
	{
		title: "Nama Teknisi",
		key: "name",
		width: 180,
		render(row) {
			return h("div", [
				h("div", { class: "font-bold text-slate-100" }, row.name),
				row.phone ? h("div", { class: "text-[11px] font-mono text-slate-400" }, row.phone) : null
			])
		}
	},
	{
		title: "Status",
		key: "is_active",
		align: "center",
		width: 90,
		render(row) {
			return h(NTag, { size: "tiny", type: row.is_active ? "success" : "default", round: true }, {
				default: () => (row.is_active ? "Aktif" : "Nonaktif")
			})
		}
	},
	{
		title: "Ditugaskan",
		key: "total_assigned",
		align: "center",
		width: 110,
		render(row) {
			return h("span", { class: "font-mono font-semibold text-slate-200" }, row.total_assigned)
		}
	},
	{
		title: "Selesai",
		key: "total_completed",
		align: "center",
		width: 100,
		render(row) {
			return h("span", { class: "font-mono font-bold text-emerald-400" }, row.total_completed)
		}
	},
	{
		title: "Batal",
		key: "total_cancelled",
		align: "center",
		width: 90,
		render(row) {
			return h("span", { class: "font-mono text-rose-400" }, row.total_cancelled)
		}
	},
	{
		title: "Sedang Dikerjakan",
		key: "total_in_progress",
		align: "center",
		width: 140,
		render(row) {
			return h("span", { class: "font-mono text-amber-300" }, row.total_in_progress)
		}
	},
	{
		title: "Success Rate (%)",
		key: "success_rate",
		align: "center",
		width: 130,
		render(row) {
			const rate = row.success_rate || 0
			const color = rate >= 80 ? "#22c55e" : rate >= 50 ? "#f59e0b" : "#ef4444"
			return h("span", { class: "font-mono font-black text-sm", style: { color } }, `${rate}%`)
		}
	},
	{
		title: "Rata-rata Waktu (Menit)",
		key: "avg_duration_minutes",
		align: "center",
		width: 170,
		render(row) {
			return row.avg_duration_minutes > 0
				? h("span", { class: "font-mono font-semibold text-sky-300" }, `${row.avg_duration_minutes} mnt`)
				: h("span", { class: "text-slate-500 italic" }, "-")
		}
	}
]

// Columns for Customer History
const customerColumns: DataTableColumns<any> = [
	{
		title: "No",
		key: "idx",
		width: 50,
		align: "center",
		render: (_, index) => index + 1
	},
	{
		title: "Nama Pelanggan",
		key: "name",
		width: 200,
		render(row) {
			return h("span", { class: "font-bold text-slate-100" }, row.name)
		}
	},
	{
		title: "No. WhatsApp / HP",
		key: "phone",
		width: 160,
		render(row) {
			return h("span", { class: "font-mono text-xs text-slate-300" }, row.phone || "-")
		}
	},
	{
		title: "Alamat",
		key: "address",
		ellipsis: { tooltip: true },
		render(row) {
			return row.address || "-"
		}
	},
	{
		title: "Total Unit Diservis",
		key: "total_tickets",
		align: "center",
		width: 150,
		render(row) {
			return h("span", { class: "font-mono font-bold text-sky-400" }, `${row.total_tickets} Kali`)
		}
	},
	{
		title: "Unit Selesai",
		key: "total_completed",
		align: "center",
		width: 120,
		render(row) {
			return h("span", { class: "font-mono font-semibold text-emerald-400" }, row.total_completed)
		}
	},
	{
		title: "Kunjungan Terakhir",
		key: "last_service_at",
		width: 150,
		render(row) {
			return row.last_service_at ? dayjs(row.last_service_at).format("YYYY-MM-DD") : "-"
		}
	}
]

// Columns for Activity Logs
const logColumns: DataTableColumns<any> = [
	{
		title: "No",
		key: "idx",
		width: 50,
		align: "center",
		render: (_, index) => index + 1
	},
	{
		title: "Waktu",
		key: "created_at",
		width: 160,
		render(row) {
			return h("span", { class: "font-mono text-xs text-slate-400" }, dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss"))
		}
	},
	{
		title: "User",
		key: "user.name",
		width: 150,
		render(row) {
			return h("span", { class: "font-semibold text-sky-300" }, row.user?.name || "Sistem")
		}
	},
	{
		title: "Aksi",
		key: "action",
		width: 160,
		render(row) {
			return h(NTag, { size: "tiny", type: "info" }, { default: () => row.action })
		}
	},
	{
		title: "Deskripsi",
		key: "description",
		render(row) {
			return h("span", { class: "text-xs text-slate-200" }, row.description)
		}
	}
]

const onPresetChange = () => {
	fetchAllAnalytics()
}

const onCustomerSearch = debounce(() => {
	fetchCustomerHistory()
}, 400)

const fetchSpareparts = async () => {
	try {
		const res = await analyticsStore.fetchSpareparts({ date_preset: datePreset.value || undefined })
		sparepartsData.value = res.data || []
		totalCategoriesUsed.value = res.total_categories_used || 0
		totalQuantitySum.value = res.total_quantity_sum || 0
	} catch (e) {
		// handle silently
	}
}

const fetchPhoneBrands = async () => {
	try {
		const res = await analyticsStore.fetchPhoneBrands({ date_preset: datePreset.value || undefined })
		phoneBrandsData.value = res.data || []
		totalBrandUnitsSum.value = res.total_units_sum || 0
	} catch (e) {
		// handle silently
	}
}

const fetchWorkers = async () => {
	try {
		const res = await analyticsStore.fetchWorkers({ date_preset: datePreset.value || undefined })
		workersData.value = res.data || []
	} catch (e) {
		// handle silently
	}
}

const fetchCustomerHistory = async () => {
	try {
		const res = await analyticsStore.fetchCustomerHistory({ search: customerSearch.value || undefined })
		customerHistoryData.value = res.data || []
	} catch (e) {
		// handle silently
	}
}

const fetchActivityLogs = async () => {
	try {
		const res = await analyticsStore.fetchActivityLogs({ per_page: 50 })
		activityLogsData.value = res.data || []
	} catch (e) {
		// handle silently
	}
}

const fetchAllAnalytics = async () => {
	loading.value = true
	try {
		await Promise.all([
			fetchSpareparts(),
			fetchPhoneBrands(),
			fetchWorkers(),
			fetchCustomerHistory(),
			fetchActivityLogs()
		])
	} catch (err: any) {
		message.error(err.response?.data?.message || err.message || "Gagal memuat analitik")
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchAllAnalytics()
})
</script>
