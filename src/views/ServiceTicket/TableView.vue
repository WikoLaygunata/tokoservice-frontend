<template>
	<div class="space-y-4">
		<!-- Filter Toolbar -->
		<n-card size="small" class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60">
			<div class="space-y-3">
				<!-- Search and Primary Filters -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<label class="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pencarian Cepat</label>
						<n-input
							v-model:value="filters.search"
							clearable
							placeholder="No. Tiket, IMEI, Model, Pelanggan..."
						>
							<template #prefix><Icon name="carbon:search" /></template>
						</n-input>
					</div>

					<div>
						<label class="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Filter Status</label>
						<n-select
							v-model:value="filters.status"
							clearable
							placeholder="Semua Status"
							:options="statusOptions"
						/>
					</div>

					<div>
						<label class="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Filter Teknisi</label>
						<n-select
							v-model:value="filters.worker_id"
							clearable
							filterable
							placeholder="Semua Teknisi"
							:options="workerOptions"
						/>
					</div>

					<div>
						<label class="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Filter Merek HP</label>
						<n-select
							v-model:value="filters.phone_brand_id"
							clearable
							filterable
							placeholder="Semua Merek"
							:options="brandOptions"
						/>
					</div>
				</div>

				<!-- Date Preset & Actions Row -->
				<div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Periode:</span>
						<n-radio-group v-model:value="filters.date_preset" size="small" @update:value="onPresetChange">
							<n-radio-button value="">Semua</n-radio-button>
							<n-radio-button value="this_month">Bulan Ini</n-radio-button>
							<n-radio-button value="last_month">Bulan Lalu</n-radio-button>
							<n-radio-button value="3_months">3 Bulan</n-radio-button>
							<n-radio-button value="6_months">6 Bulan</n-radio-button>
							<n-radio-button value="ytd">YTD</n-radio-button>
							<n-radio-button value="1_year">1 Tahun</n-radio-button>
						</n-radio-group>
					</div>

					<div class="flex items-center gap-2">
						<n-button size="small" secondary type="success" :loading="exporting" @click="handleExportExcel">
							<template #icon><Icon name="tabler:file-spreadsheet" :size="16" /></template>
							Export Excel (.xlsx)
						</n-button>
						<n-button size="small" secondary @click="resetFilters">
							<template #icon><Icon name="tabler:filter-off" :size="16" /></template>
							Reset Filter
						</n-button>
					</div>
				</div>
			</div>
		</n-card>

		<!-- Data Table -->
		<n-card size="small" class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60">
			<n-data-table
				ref="ticketTableRef"
				:columns="columns"
				:data="tableData"
				:loading="loading"
				:max-height="scrollbarMaxHeight"
				:pagination="pagination"
				remote
				:single-column="true"
				:single-line="false"
				size="small"
				@update:page="handlePageChange"
				@update:pageSize="handlePageSizeChange"
				@update:sorter="handleSorterChange"
			/>
		</n-card>

		<n-modal
			v-model:show="showDetailModal"
			preset="card"
			:class="themeStore.isThemeDark ? '!bg-slate-900' : '!bg-white'"
			style="width: 680px; max-width: 95vw"
			:title="`Detail Tiket ${selectedTicket?.ticket_number || ''}`"
		>
			<div v-if="selectedTicket" class="space-y-4">
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div :class="detailMutedSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailLabelClass" class="text-[11px]">Status</div>
						<n-tag class="mt-1" size="small" :type="getStatusTagType(selectedTicket.status)">{{ selectedTicket.status }}</n-tag>
					</div>
					<div :class="detailMutedSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailLabelClass" class="text-[11px]">Pelanggan</div>
						<div :class="detailValueClass" class="mt-1 text-sm font-semibold">{{ selectedTicket.customer?.name || "-" }}</div>
						<div :class="detailLabelClass" class="text-xs">{{ selectedTicket.customer?.phone || "-" }}</div>
					</div>
					<div :class="detailMutedSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailLabelClass" class="text-[11px]">Teknisi</div>
						<div :class="detailValueClass" class="mt-1 text-sm font-semibold">{{ selectedTicket.worker?.name || "Belum ditugaskan" }}</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div :class="detailSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailHeadingClass" class="mb-2 text-xs font-bold">Informasi Perangkat</div>
						<div :class="detailBodyClass" class="space-y-1 text-xs">
							<div><span :class="detailLabelClass">Merek:</span> {{ selectedTicket.phoneBrand?.name || selectedTicket.phone_brand?.name || "-" }}</div>
							<div><span :class="detailLabelClass">Model:</span> {{ selectedTicket.model_name || "-" }}</div>
							<div><span :class="detailLabelClass">IMEI/SN:</span> {{ selectedTicket.imei || "-" }}</div>
							<div><span :class="detailLabelClass">Passcode:</span> {{ selectedTicket.passcode || "-" }}</div>
						</div>
					</div>
					<div :class="detailSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailHeadingClass" class="mb-2 text-xs font-bold">Informasi Servis</div>
						<div :class="detailBodyClass" class="space-y-1 text-xs">
							<div><span :class="detailLabelClass">Garansi:</span> {{ selectedTicket.warranty_days ?? 0 }} hari</div>
							<div><span :class="detailLabelClass">Garansi sampai:</span> {{ selectedTicket.warranty_expires_at ? dayjs(selectedTicket.warranty_expires_at).format("DD MMM YYYY") : "-" }}</div>
							<div><span :class="detailLabelClass">Mulai dikerjakan:</span> {{ selectedTicket.started_at ? dayjs(selectedTicket.started_at).format("DD MMM YYYY HH:mm") : "-" }}</div>
							<div><span :class="detailLabelClass">Dibuat:</span> {{ selectedTicket.created_at ? dayjs(selectedTicket.created_at).format("DD MMM YYYY HH:mm") : "-" }}</div>
							<div><span :class="detailLabelClass">Selesai:</span> {{ selectedTicket.finished_at ? dayjs(selectedTicket.finished_at).format("DD MMM YYYY HH:mm") : "-" }}</div>
							<div><span :class="detailLabelClass">Durasi:</span> {{ selectedTicket.repair_duration_minutes ? `${selectedTicket.repair_duration_minutes} menit` : "-" }}</div>
						</div>
					</div>
				</div>

				<div :class="detailSurfaceClass" class="rounded-lg border p-3">
					<div :class="detailHeadingClass" class="mb-2 text-xs font-bold">Kontak Pelanggan</div>
					<div :class="detailBodyClass" class="space-y-1 text-xs">
						<div><span :class="detailLabelClass">Nama:</span> {{ selectedTicket.customer?.name || "-" }}</div>
						<div><span :class="detailLabelClass">Telepon:</span> {{ selectedTicket.customer?.phone || "-" }}</div>
						<div><span :class="detailLabelClass">Alamat:</span> {{ selectedTicket.customer?.address || "-" }}</div>
					</div>
				</div>

				<div :class="detailSurfaceClass" class="rounded-lg border p-3">
					<div :class="detailHeadingClass" class="mb-2 text-xs font-bold">Jasa Servis & Sparepart</div>
					<div v-if="ticketServiceCategories.length" class="space-y-2">
						<div v-for="category in ticketServiceCategories" :key="category.id" :class="detailMutedSurfaceClass" class="flex items-center justify-between rounded-md px-3 py-2 text-xs">
							<span :class="detailValueClass">{{ category.name }}</span>
							<span :class="detailLabelClass" class="font-mono">{{ category.pivot?.qty ?? category.qty ?? 1 }} pcs</span>
						</div>
					</div>
					<div v-else :class="detailLabelClass" class="text-sm">Tidak ada jasa atau sparepart.</div>
				</div>

				<div class="space-y-3">
					<div :class="detailMutedSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailHeadingClass" class="mb-1 text-xs font-bold">Kondisi Fisik</div>
						<div :class="detailBodyClass" class="whitespace-pre-wrap text-sm">{{ selectedTicket.device_condition || "-" }}</div>
					</div>
					<div :class="detailMutedSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailHeadingClass" class="mb-1 text-xs font-bold">Keluhan Kerusakan</div>
						<div :class="detailBodyClass" class="whitespace-pre-wrap text-sm">{{ selectedTicket.fault_description || "-" }}</div>
					</div>
					<div :class="detailMutedSurfaceClass" class="rounded-lg border p-3">
						<div :class="detailHeadingClass" class="mb-1 text-xs font-bold">Catatan Workshop</div>
						<div :class="detailBodyClass" class="whitespace-pre-wrap text-sm">{{ selectedTicket.notes || "-" }}</div>
					</div>
				</div>

				<div :class="detailSurfaceClass" class="rounded-lg border p-3">
					<div class="mb-2 flex items-center justify-between gap-2">
						<div :class="detailHeadingClass" class="text-xs font-bold">Riwayat Aktivitas Tiket</div>
						<n-spin v-if="ticketLogsLoading" size="small" />
					</div>
					<div v-if="ticketLogsError" :class="detailBodyClass" class="text-xs">{{ ticketLogsError }}</div>
					<div v-else-if="!ticketLogsLoading && !ticketActivityLogs.length" :class="detailLabelClass" class="text-sm">
						Belum ada riwayat aktivitas untuk tiket ini.
					</div>
					<div v-else class="max-h-56 space-y-2 overflow-y-auto pr-1">
						<div
							v-for="log in ticketActivityLogs"
							:key="log.id"
							:class="detailMutedSurfaceClass"
							class="rounded-md border px-3 py-2"
						>
							<div class="flex flex-wrap items-center justify-between gap-2">
								<n-tag size="small" type="info" :bordered="false">{{ log.action }}</n-tag>
								<span :class="detailLabelClass" class="text-[11px]">{{ dayjs(log.created_at).format("DD MMM YYYY HH:mm") }}</span>
							</div>
							<div :class="detailBodyClass" class="mt-1 text-xs">{{ log.description || "-" }}</div>
							<div :class="detailLabelClass" class="mt-1 text-[11px]">{{ log.user_name || "Sistem" }}</div>
						</div>
					</div>
				</div>

				<div :class="detailSurfaceClass" class="rounded-lg border p-3">
					<div :class="detailHeadingClass" class="mb-2 text-xs font-bold">Dokumentasi Foto Unit</div>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div v-for="(photo, index) in ticketPhotos" :key="photo" :class="detailPhotoClass" class="overflow-hidden rounded-lg border">
							<div :class="detailBodyClass" class="border-b px-3 py-2 text-xs font-semibold">Foto {{ index + 1 }}</div>
							<img :src="photo" :alt="`Foto ${index + 1} tiket`" class="h-48 w-full object-contain" :class="themeStore.isThemeDark ? 'bg-slate-950' : 'bg-slate-200'" />
						</div>
					</div>
					<div v-if="!ticketPhotos.length" :class="detailLabelClass" class="text-sm">Belum ada dokumentasi foto.</div>
				</div>
			</div>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import { updateScreenMaxHeight } from "@/mixins"
import { useSelectOptionsStore } from "@/stores/selectOptions"
import { useThemeStore } from "@/stores/theme"
import { renderIcon } from "@/utils"
import { can as canDo } from "@/utils/auth"
import { exportTicketsToExcel } from "@/utils/excelExport"
import { resolveImageUrl } from "@/utils/imageUrl"
import axios from "axios"
import dayjs from "dayjs"
import { debounce } from "lodash"
import {
	NButton,
	NCard,
	NDataTable,
	NDropdown,
	NInput,
	NModal,
	NRadioButton,
	NRadioGroup,
	NSelect,
	NSpin,
	NTag,
	useDialog,
	useMessage,
	type DataTableColumns
} from "naive-ui"
import { computed, h, onMounted, reactive, ref, watch } from "vue"
import { useAnalyticsStore, type ActivityLogItem } from "@/stores/analytics"

const emit = defineEmits<{
	(e: "editTicket", ticket: any): void
	(e: "chatWa", ticket: any): void
	(e: "printJobsheet", ticket: any): void
	(e: "refresh"): void
}>()

const message = useMessage()
const dialog = useDialog()
const selectOptionsStore = useSelectOptionsStore()
const analyticsStore = useAnalyticsStore()
const themeStore = useThemeStore()
const detailSurfaceClass = computed(() =>
	themeStore.isThemeDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
)
const detailMutedSurfaceClass = computed(() =>
	themeStore.isThemeDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"
)
const detailPhotoClass = computed(() =>
	themeStore.isThemeDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-100"
)
const detailHeadingClass = computed(() => (themeStore.isThemeDark ? "text-slate-100" : "text-slate-700"))
const detailValueClass = computed(() => (themeStore.isThemeDark ? "text-slate-100" : "text-slate-800"))
const detailBodyClass = computed(() => (themeStore.isThemeDark ? "text-slate-300" : "text-slate-600"))
const detailLabelClass = computed(() => (themeStore.isThemeDark ? "text-slate-400" : "text-slate-500"))

const loading = ref(false)
const exporting = ref(false)
const tableData = ref<any[]>([])
const selectedTicket = ref<any | null>(null)
const showDetailModal = ref(false)
const ticketActivityLogs = ref<ActivityLogItem[]>([])
const ticketLogsLoading = ref(false)
const ticketLogsError = ref("")
const ticketPhotos = computed(() => {
	if (!selectedTicket.value) return []
	return [selectedTicket.value.photo_1_url || selectedTicket.value.photo_1, selectedTicket.value.photo_2_url || selectedTicket.value.photo_2]
		.filter(Boolean)
		.map(photo => resolveImageUrl(photo))
})
const ticketServiceCategories = computed(() => selectedTicket.value?.serviceCategories || selectedTicket.value?.service_categories || [])

const openTicketDetail = async (ticket: any) => {
	selectedTicket.value = ticket
	ticketActivityLogs.value = []
	ticketLogsError.value = ""
	showDetailModal.value = true
	ticketLogsLoading.value = true

	try {
		const result = await analyticsStore.fetchActivityLogs(
			{ search: `#${ticket.ticket_number}`, page: 1, pageSize: 100 },
			true
		)
		ticketActivityLogs.value = (result.data || []) as ActivityLogItem[]
	} catch (error: any) {
		ticketLogsError.value = error.response?.data?.message || error.message || "Gagal memuat riwayat aktivitas tiket."
	} finally {
		ticketLogsLoading.value = false
	}
}
const scrollbarMaxHeight = updateScreenMaxHeight(320)

const filters = reactive({
	search: "",
	status: null as string | null,
	worker_id: null as number | null,
	phone_brand_id: null as number | null,
	date_preset: ""
})

const paginationReactive = reactive({
	page: 1,
	pageCount: 1,
	pageSize: 10,
	showSizePicker: true,
	pageSizes: [10, 20, 50, 100],
	dataCount: 0,
	sorter: {} as any
})
const pagination = ref(paginationReactive)

const statusOptions = [
	{ value: "Diterima", label: "Diterima" },
	{ value: "Diagnosis", label: "Diagnosis" },
	{ value: "Menunggu Part", label: "Menunggu Part" },
	{ value: "Pengerjaan", label: "Pengerjaan" },
	{ value: "Menunggu Diterima", label: "Menunggu Diterima" },
	{ value: "Selesai", label: "Selesai" },
	{ value: "Batal", label: "Batal" }
]

const workerOptions = computed(() => selectOptionsStore.getOptions("workers"))
const brandOptions = computed(() => selectOptionsStore.getOptions("phoneBrands"))

const getStatusTagType = (status: string) => {
	switch (status) {
		case "Diterima": return "info"
		case "Diagnosis": return "warning"
		case "Menunggu Part": return "warning"
		case "Pengerjaan": return "primary"
		case "Menunggu Diterima": return "error"
		case "Selesai": return "success"
		case "Batal": return "default"
		default: return "default"
	}
}

const columns = reactive<DataTableColumns<any>>([
	{
		title: "No",
		key: "row_number",
		width: 60,
		align: "center",
		render(_, index) {
			return h("span", { class: "font-mono text-xs text-slate-600 dark:text-slate-300" }, (paginationReactive.page - 1) * paginationReactive.pageSize + index + 1)
		}
	},
	{
		title: "No. Tiket",
		key: "ticket_number",
		sorter: true,
		width: 170,
		render(row) {
			return h("button", {
				type: "button",
				class: "flex items-center gap-1 font-mono text-xs font-bold text-sky-400 transition-colors hover:text-sky-300 hover:underline",
				title: "Lihat detail tiket",
				onClick: () => {
					openTicketDetail(row)
				}
			}, [
				h(Icon, { name: "tabler:receipt", size: 14 }),
				row.ticket_number
			])
		}
	},
	{
		title: "Pelanggan",
		key: "customer.name",
		width: 170,
		render(row) {
			return h("div", { class: "text-xs" }, [
				h("div", { class: "font-bold text-slate-800 dark:text-slate-100" }, row.customer?.name || "-"),
				h("div", { class: "font-mono text-[11px] text-slate-500 dark:text-slate-400" }, row.customer?.phone || "-")
			])
		}
	},
	{
		title: "Unit Smartphone",
		key: "model_name",
		width: 180,
		render(row) {
			return h("div", { class: "text-xs" }, [
				h("div", { class: "font-bold text-slate-700 dark:text-slate-200" }, [
					h("span", { class: "text-indigo-400 mr-1" }, `[${row.phoneBrand?.name || row.phone_brand?.name || "HP"}]`),
					row.model_name
				]),
				row.imei ? h("div", { class: "font-mono text-[10px] text-slate-500" }, `IMEI: ${row.imei}`) : null
			])
		}
	},
	{
		title: "Keluhan Kerusakan",
		key: "fault_description",
		ellipsis: { tooltip: true },
		render(row) {
			return 			h("span", { class: "text-xs" }, row.fault_description || "-")
		}
	},
	{
		title: "Teknisi",
		key: "worker.name",
		width: 140,
		render(row) {
			return row.worker?.name
				? h("span", { class: "text-xs font-medium text-sky-300" }, row.worker.name)
				: h("span", { class: "text-xs text-slate-500 italic" }, "Belum ada")
		}
	},
	{
		title: "Status",
		key: "status",
		align: "center",
		width: 140,
		sorter: true,
		render(row) {
			return h(
				NTag,
				{
					type: getStatusTagType(row.status),
					round: true,
					size: "small",
					bordered: false
				},
				{ default: () => row.status }
			)
		}
	},
	{
		title: "Tgl Masuk",
		key: "created_at",
		sorter: true,
		width: 130,
		render(row) {
			return row.created_at ? h("span", { class: "font-mono text-xs text-slate-500 dark:text-slate-400" }, dayjs(row.created_at).format("YYYY-MM-DD HH:mm")) : "-"
		}
	},
	{
		title: "Aksi",
		key: "actions",
		align: "center",
		width: 70,
		render(row) {
			return h(
				NDropdown,
				{
					trigger: "click",
					placement: "bottom-end",
					onSelect: (key: string) => handleDataAction(row, key),
					options: [
						{
							label: "Detail & Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						{
							label: "Chat WhatsApp",
							key: "action-wa",
							icon: () => h(Icon, { name: "tabler:brand-whatsapp", color: "#22c55e" })
						},
						{
							label: "Cetak Job Sheet (A5)",
							key: "action-print",
							icon: () => h(Icon, { name: "tabler:printer", color: "#f59e0b" })
						},
						canDo("delete-service_ticket") && {
							label: "Hapus Tiket",
							key: "action-delete",
							icon: () => h(Icon, { name: "tabler:trash", color: "#ef4444" })
						}
					].filter(Boolean) as any
				},
				{ default: () => h(NButton, { size: "small", secondary: true }, renderIcon("carbon:overflow-menu-vertical")) }
			)
		}
	}
])

const fetchData = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("service-tickets", {
			params: {
				page: paginationReactive.page,
				per_page: paginationReactive.pageSize,
				sort_by: paginationReactive.sorter?.field,
				sort_order: paginationReactive.sorter?.order === "ascend" ? "asc" : paginationReactive.sorter?.order === "descend" ? "desc" : undefined,
				search: filters.search || undefined,
				status: filters.status || undefined,
				worker_id: filters.worker_id || undefined,
				phone_brand_id: filters.phone_brand_id || undefined,
				date_preset: filters.date_preset || undefined
			}
		})

		tableData.value = data.data || []
		paginationReactive.dataCount = data.total || 0
		paginationReactive.pageCount = data.last_page || 1
	} catch (err: any) {
		message.error(err.response?.data?.message || err.message || "Gagal memuat data riwayat tiket")
	} finally {
		loading.value = false
	}
}

const onPresetChange = () => {
	paginationReactive.page = 1
	fetchData()
}

const resetFilters = () => {
	filters.search = ""
	filters.status = null
	filters.worker_id = null
	filters.phone_brand_id = null
	filters.date_preset = ""
	paginationReactive.page = 1
	fetchData()
}

const handleExportExcel = async () => {
	exporting.value = true
	try {
		// Fetch all matching records without pagination
		const { data } = await axios.get("service-tickets", {
			params: {
				all: 1,
				search: filters.search || undefined,
				status: filters.status || undefined,
				worker_id: filters.worker_id || undefined,
				phone_brand_id: filters.phone_brand_id || undefined,
				date_preset: filters.date_preset || undefined
			}
		})

		const items = Array.isArray(data) ? data : data.data || []
		if (items.length === 0) {
			message.warning("Tidak ada data tiket servis untuk diexport.")
			return
		}

		exportTicketsToExcel(items, "rekap_tiket_servis")
		message.success(`Berhasil mengunduh ${items.length} data tiket servis ke Excel (.xlsx)`)
	} catch (err: any) {
		message.error(err.response?.data?.message || err.message || "Gagal mengexport file Excel")
	} finally {
		exporting.value = false
	}
}

const handleSorterChange = (sorter: any) => {
	paginationReactive.sorter = sorter
	fetchData()
}

const handlePageChange = (page: number) => {
	paginationReactive.page = page
	fetchData()
}

const handlePageSizeChange = (pageSize: number) => {
	paginationReactive.pageSize = pageSize
	paginationReactive.page = 1
	fetchData()
}

const handleDataAction = (row: any, key: string) => {
	if (key === "action-edit") {
		emit("editTicket", row)
	} else if (key === "action-wa") {
		emit("chatWa", row)
	} else if (key === "action-print") {
		emit("printJobsheet", row)
	} else if (key === "action-delete") {
		const d = dialog.warning({
			title: "Hapus Tiket Servis",
			content: `Apakah Anda yakin ingin menghapus tiket #${row.ticket_number}?`,
			positiveText: "Hapus",
			negativeText: "Batal",
			positiveButtonProps: { type: "error" },
			onPositiveClick: async () => {
				d.loading = true
				try {
					const { data } = await axios.delete(`service-tickets/${row.id}`)
					message.success(data.message || "Tiket servis berhasil dihapus")
					fetchData()
					emit("refresh")
				} catch (err: any) {
					message.error(err.response?.data?.message || err.message || "Gagal menghapus tiket")
				} finally {
					d.loading = false
				}
			}
		})
	}
}

watch(
	() => [filters.search, filters.status, filters.worker_id, filters.phone_brand_id],
	debounce(() => {
		paginationReactive.page = 1
		fetchData()
	}, 400)
)

defineExpose({
	fetchData
})

onMounted(async () => {
	await Promise.all([
		selectOptionsStore.ensureOptions("workers"),
		selectOptionsStore.ensureOptions("phoneBrands")
	])
	fetchData()
})
</script>
