<template>
	<div class="space-y-4">
		<!-- Board Header & Refresh Bar -->
		<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/40">
			<div class="flex items-center gap-2">
				<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
					<Icon name="tabler:layout-kanban" :size="18" />
				</div>
				<div>
					<span class="text-sm font-bold text-slate-800 dark:text-slate-100">Antrean Aktif Meja Kerja Workshop</span>
					<span class="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-mono font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
						{{ totalActiveTickets }} Unit Aktif
					</span>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<n-button size="small" secondary :loading="loading" @click="fetchBoard">
					<template #icon><Icon name="tabler:refresh" :size="16" /></template>
					Refresh Antrean
				</n-button>
			</div>
		</div>

		<!-- Kanban Board Columns (5 Active Stages) -->
		<n-spin :show="loading">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				<div
					v-for="col in columnsConfig"
					:key="col.status"
					class="flex flex-col rounded-xl border bg-white shadow-sm dark:bg-slate-900/50"
					:style="{ borderColor: col.borderColor }"
				>
					<!-- Column Header -->
					<div
						class="flex items-center justify-between border-b p-3 rounded-t-xl"
						:style="{
							backgroundColor: col.headerBg,
							borderColor: col.borderColor
						}"
					>
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: col.accentColor }"></span>
							<span class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
								{{ col.status }}
							</span>
						</div>
						<span
							class="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white shadow-sm"
							:style="{ backgroundColor: col.accentColor }"
						>
							{{ (boardData[col.status] || []).length }}
						</span>
					</div>

					<!-- Column Card List -->
					<div class="flex-1 space-y-3 p-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
						<div
							v-if="!boardData[col.status] || boardData[col.status].length === 0"
							class="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700/60"
						>
							<Icon name="tabler:inbox" :size="24" class="opacity-40 mb-1" />
							<span>Tidak ada unit</span>
						</div>

						<div
							v-for="ticket in boardData[col.status]"
							:key="ticket.id"
							class="group relative rounded-lg border border-slate-200 bg-white p-3 shadow transition-all hover:border-slate-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-slate-500"
						>
							<!-- Ticket Number & Brand -->
							<div class="flex items-start justify-between gap-1 mb-1.5">
								<div class="font-mono text-xs font-bold text-sky-400">
									{{ ticket.ticket_number }}
								</div>
								<span class="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700/80 dark:text-slate-200">
									{{ ticket.phoneBrand?.name || ticket.phone_brand?.name || "Unit" }}
								</span>
							</div>

							<!-- Model Name -->
							<div class="text-sm font-bold text-slate-800 mb-1 leading-snug dark:text-slate-100">
								{{ ticket.model_name }}
							</div>

							<!-- Customer Name & Phone -->
							<div class="flex items-center gap-1 text-xs text-slate-600 mb-2 dark:text-slate-300">
								<Icon name="tabler:user" :size="13" color="#94a3b8" />
								<span class="font-medium truncate">{{ ticket.customer?.name || "-" }}</span>
								<span v-if="ticket.customer?.phone" class="font-mono text-[10px] text-slate-500 truncate dark:text-slate-400">
									({{ ticket.customer.phone }})
								</span>
							</div>

							<!-- Fault Description -->
							<div class="rounded bg-slate-50 p-2 text-xs text-slate-600 border border-slate-200 mb-2 line-clamp-2 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700/40">
								<span class="font-semibold text-slate-500 dark:text-slate-400">Kerusakan:</span> {{ ticket.fault_description }}
							</div>

							<!-- Passcode / Security Badge if present -->
							<div v-if="ticket.passcode" class="mb-2 flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-50 px-2 py-0.5 rounded border border-amber-800/30">
								<Icon name="tabler:lock" :size="12" />
								<span>PIN/Pola: <b>{{ ticket.passcode }}</b></span>
							</div>

							<!-- Worker / Technician Badge -->
							<div class="flex items-center justify-between text-[11px] text-slate-500 mb-3 pt-1 border-t border-slate-200 dark:border-slate-700/50 dark:text-slate-400">
								<div class="flex items-center gap-1">
									<Icon name="tabler:tool" :size="13" color="#38bdf8" />
									<span :class="ticket.worker?.name ? 'text-sky-300 font-semibold' : 'text-slate-500 italic'">
										{{ ticket.worker?.name || "Belum ada teknisi" }}
									</span>
								</div>
								<span class="text-[10px] text-slate-500 font-mono">
									{{ formatTimeElapsed(ticket.created_at) }}
								</span>
							</div>

							<!-- Action Buttons Bar -->
							<div class="flex items-center justify-between gap-1 pt-1">
								<!-- Quick Move Status Dropdown -->
								<n-dropdown
									trigger="click"
									:options="getStatusChangeOptions(ticket.status)"
									@select="(newStatus: string) => handleQuickStatusChange(ticket.id, newStatus)"
								>
									<n-button size="tiny" secondary type="info">
										<template #icon><Icon name="tabler:arrows-exchange" :size="13" /></template>
										Pindah Status
									</n-button>
								</n-dropdown>

								<div class="flex items-center gap-1">
									<!-- WhatsApp Button -->
									<n-button
										circle
										size="tiny"
										quaternary
										type="success"
										title="Kirim WhatsApp"
										@click="$emit('chatWa', ticket)"
									>
										<template #icon><Icon name="tabler:brand-whatsapp" :size="15" color="#22c55e" /></template>
									</n-button>

									<!-- Print Job Sheet Button -->
									<n-button
										circle
										size="tiny"
										quaternary
										type="warning"
										title="Cetak Job Sheet A5"
										@click="$emit('printJobsheet', ticket)"
									>
										<template #icon><Icon name="tabler:printer" :size="15" color="#f59e0b" /></template>
									</n-button>

									<!-- Edit Ticket Button -->
									<n-button
										circle
										size="tiny"
										quaternary
										title="Detail & Edit Tiket"
										@click="$emit('editTicket', ticket)"
									>
										<template #icon><Icon name="tabler:edit" :size="15" color="#38bdf8" /></template>
									</n-button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</n-spin>
	</div>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import axios from "axios"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { NButton, NDropdown, NSpin, useMessage } from "naive-ui"
import { computed, onMounted, ref } from "vue"

dayjs.extend(relativeTime)

const emit = defineEmits<{
	(e: "editTicket", ticket: any): void
	(e: "chatWa", ticket: any): void
	(e: "printJobsheet", ticket: any): void
	(e: "refresh"): void
}>()

const message = useMessage()
const loading = ref(false)
const boardData = ref<Record<string, any[]>>({
	"Diterima": [],
	"Diagnosis": [],
	"Menunggu Part": [],
	"Pengerjaan": [],
	"Menunggu Diterima": []
})

const columnsConfig = [
	{
		status: "Diterima",
		accentColor: "#3b82f6", // blue
		headerBg: "rgba(59, 130, 246, 0.15)",
		borderColor: "rgba(59, 130, 246, 0.3)"
	},
	{
		status: "Diagnosis",
		accentColor: "#a855f7", // purple
		headerBg: "rgba(168, 85, 247, 0.15)",
		borderColor: "rgba(168, 85, 247, 0.3)"
	},
	{
		status: "Menunggu Part",
		accentColor: "#f59e0b", // amber
		headerBg: "rgba(245, 158, 11, 0.15)",
		borderColor: "rgba(245, 158, 11, 0.3)"
	},
	{
		status: "Pengerjaan",
		accentColor: "#06b6d4", // cyan / teal
		headerBg: "rgba(6, 182, 212, 0.15)",
		borderColor: "rgba(6, 182, 212, 0.3)"
	},
	{
		status: "Menunggu Diterima",
		accentColor: "#f97316", // orange
		headerBg: "rgba(249, 115, 22, 0.15)",
		borderColor: "rgba(249, 115, 22, 0.3)"
	}
]

const allStatuses = [
	"Diterima",
	"Diagnosis",
	"Menunggu Part",
	"Pengerjaan",
	"Menunggu Diterima",
	"Selesai",
	"Batal"
]

const totalActiveTickets = computed(() => {
	return Object.values(boardData.value).reduce((sum, arr) => sum + (arr?.length || 0), 0)
})

const formatTimeElapsed = (dateStr?: string) => {
	if (!dateStr) return "-"
	return dayjs(dateStr).fromNow()
}

const getStatusChangeOptions = (currentStatus: string) => {
	return allStatuses
		.filter(s => s !== currentStatus)
		.map(s => ({
			label: `Pindah ke → ${s}`,
			key: s
		}))
}

const fetchBoard = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("service-tickets/board")
		boardData.value = data.data || data || {}
	} catch (err: any) {
		message.error(err.response?.data?.message || err.message || "Gagal memuat Kanban board")
	} finally {
		loading.value = false
	}
}

const handleQuickStatusChange = async (ticketId: number, newStatus: string) => {
	try {
		const { data } = await axios.patch(`service-tickets/${ticketId}/status`, { status: newStatus })
		message.success(data.message || `Status berhasil diubah ke ${newStatus}`)
		await fetchBoard()
		emit("refresh")
	} catch (err: any) {
		message.error(err.response?.data?.message || err.message || "Gagal memperbarui status tiket")
	}
}

defineExpose({
	fetchBoard
})

onMounted(() => {
	fetchBoard()
})
</script>
