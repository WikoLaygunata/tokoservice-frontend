<template>
	<n-modal
		v-model:show="show"
		preset="card"
		style="width: 780px; max-width: 98vw"
		title="Cetak Job Sheet Meja Servis (A5 Portrait)"
		@after-leave="handleClose"
	>
		<!-- Actions bar -->
		<div class="mb-4 flex items-center justify-between rounded-lg bg-slate-100 p-3 print:hidden dark:bg-slate-800/80">
			<div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
				<Icon name="tabler:printer" :size="18" color="#38bdf8" />
				<span>Format Cetak: <b>A5 Portrait (148mm x 210mm)</b>. Siap dicetak langsung ke printer workshop.</span>
			</div>
			<n-button type="primary" size="small" @click="handlePrint">
				<template #icon><Icon name="tabler:printer" :size="16" /></template>
				Cetak Lembar Kerja A5
			</n-button>
		</div>

		<!-- A5 Job Sheet Container -->
		<div class="flex justify-center overflow-x-auto rounded-xl bg-slate-100 p-2 dark:bg-slate-900/40">
			<div id="job-sheet-print-area" class="job-sheet-container bg-white text-slate-900 shadow-xl">
				<!-- Header Toko & Judul Lembar Kerja -->
				<div class="border-b-2 border-slate-900 pb-2 mb-2 flex items-start justify-between">
					<div>
						<div class="text-base font-black tracking-tight text-slate-900 uppercase leading-none">
							{{ storeInfo.name || "WORKSHOP TOKO SERVIS HP" }}
						</div>
						<div class="text-[10px] text-slate-600 mt-1 leading-tight max-w-[280px]">
							{{ storeInfo.address || "Jl. Workshop Servis Smartphone No. 123" }}
						</div>
						<div class="text-[10px] text-slate-600 font-semibold mt-0.5">
							WA/Telp: {{ storeInfo.phone || "0812-3456-7890" }}
						</div>
					</div>
					<div class="text-right">
						<div class="inline-block bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
							JOB SHEET FISIK TEKNISI
						</div>
						<!-- Barcode SVG -->
						<div class="mt-1 flex flex-col items-end">
							<svg ref="barcodeSvg" class="max-h-[38px] max-w-[140px]"></svg>
							<div class="text-xs font-mono font-black text-slate-900 tracking-wider">
								{{ ticket?.ticket_number || "TCK-0000" }}
							</div>
						</div>
					</div>
				</div>

				<!-- Baris Info Tiket & Pelanggan -->
				<div class="grid grid-cols-2 gap-2 mb-2 text-[10.5px]">
					<div class="border border-slate-300 rounded p-1.5 bg-slate-50">
						<div class="font-bold text-slate-700 text-[9px] uppercase tracking-wider mb-0.5">Data Pelanggan</div>
						<div class="font-bold text-slate-900 text-xs">{{ ticket?.customer?.name || "-" }}</div>
						<div class="font-mono text-slate-700">{{ ticket?.customer?.phone || "-" }}</div>
						<div class="text-slate-600 truncate text-[9.5px]">{{ ticket?.customer?.address || "-" }}</div>
					</div>

					<div class="border border-slate-300 rounded p-1.5 bg-slate-50">
						<div class="font-bold text-slate-700 text-[9px] uppercase tracking-wider mb-0.5">Spesifikasi Unit</div>
						<div class="font-bold text-slate-900 text-xs">
							{{ ticket?.phoneBrand?.name || ticket?.phone_brand?.name || "" }} {{ ticket?.model_name || "-" }}
						</div>
						<div class="text-slate-700 text-[9.5px]">IMEI: <span class="font-mono font-semibold">{{ ticket?.imei || "-" }}</span></div>
						<div class="text-slate-700 text-[9.5px]">Tgl Masuk: <span class="font-mono">{{ formatDate(ticket?.created_at) }}</span></div>
					</div>
				</div>

				<!-- Kotak PIN / Kunci Pola & Teknisi -->
				<div class="grid grid-cols-3 gap-2 mb-2 text-[10.5px]">
					<div class="border-2 border-red-500/80 bg-red-50/60 rounded p-1.5 col-span-2 flex items-center justify-between">
						<div>
							<div class="text-[9px] font-bold text-red-700 uppercase tracking-wider">PIN / Passcode / Kunci Pola</div>
							<div class="text-sm font-mono font-black text-red-900 mt-0.5">
								{{ ticket?.passcode || "(Tidak Ada / Tanpa Kunci)" }}
							</div>
						</div>
						<div class="text-[9px] text-red-600/80 italic text-right max-w-[120px]">
							Untuk pengujian QC fungsi perangkat
						</div>
					</div>

					<div class="border border-slate-300 rounded p-1.5 bg-slate-50">
						<div class="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Teknisi PIC</div>
						<div class="text-xs font-bold text-slate-900 mt-0.5">{{ ticket?.worker?.name || "Belum Ditugaskan" }}</div>
						<div class="text-[9px] text-slate-500">Garansi: {{ ticket?.warranty_days ?? 30 }} Hari</div>
					</div>
				</div>

				<!-- Kerusakan & Kondisi Fisik Masuk -->
				<div class="border border-slate-300 rounded p-1.5 mb-2 text-[10.5px] bg-slate-50">
					<div class="grid grid-cols-2 gap-2">
						<div>
							<div class="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Keluhan Kerusakan:</div>
							<div class="font-semibold text-slate-900 mt-0.5 leading-snug">{{ ticket?.fault_description || "-" }}</div>
						</div>
						<div>
							<div class="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Kondisi Fisik Saat Diterima:</div>
							<div class="text-slate-800 mt-0.5 leading-snug">{{ ticket?.device_condition || "Tidak ada cacat khusus yang dicatat." }}</div>
						</div>
					</div>
				</div>

				<!-- Estimasi Jasa & Sparepart -->
				<div v-if="ticketCategories.length > 0" class="mb-2">
					<div class="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-1">Daftar Estimasi Jasa / Sparepart:</div>
					<table class="w-full text-[10px] border border-slate-300 rounded">
						<thead>
							<tr class="bg-slate-200 text-slate-800 text-left font-bold">
								<th class="p-1 border-r border-slate-300 w-8 text-center">No</th>
								<th class="p-1 border-r border-slate-300">Nama Pekerjaan / Sparepart</th>
								<th class="p-1 w-16 text-center">Qty</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(cat, idx) in ticketCategories" :key="idx" class="border-t border-slate-300">
								<td class="p-1 border-r border-slate-300 text-center">{{ idx + 1 }}</td>
								<td class="p-1 border-r border-slate-300 font-semibold">{{ cat.name }}</td>
								<td class="p-1 text-center font-mono">{{ cat.pivot?.qty || cat.qty || 1 }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Tabel Checklist Manual QC Teknisi (8 Poin Standar Meja Kerja) -->
				<div class="mb-2">
					<div class="text-[9px] font-bold text-slate-900 uppercase tracking-wider mb-0.5 flex items-center justify-between">
						<span>Checklist Pengujian QC Teknisi (Diisi Manual)</span>
						<span class="text-[8px] font-normal text-slate-500">Beri tanda centang (✓) pada hasil pengujian</span>
					</div>
					<table class="w-full text-[9px] border border-slate-900">
						<thead>
							<tr class="bg-slate-900 text-white font-bold text-center">
								<th class="p-0.5 border-r border-slate-700 w-6">No</th>
								<th class="p-0.5 border-r border-slate-700 text-left pl-1.5">Fungsi / Komponen Unit</th>
								<th class="p-0.5 border-r border-slate-700 w-12">Masuk</th>
								<th class="p-0.5 border-r border-slate-700 w-12">Keluar</th>
								<th class="p-0.5 text-left pl-1.5">Catatan QC</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, idx) in qcChecklistItems" :key="idx" class="border-t border-slate-300">
								<td class="p-0.5 border-r border-slate-300 text-center font-mono">{{ idx + 1 }}</td>
								<td class="p-0.5 border-r border-slate-300 font-medium pl-1.5">{{ item }}</td>
								<td class="p-0.5 border-r border-slate-300 text-center font-mono text-[8px] text-slate-400">[ &nbsp; ]</td>
								<td class="p-0.5 border-r border-slate-300 text-center font-mono text-[8px] text-slate-400">[ &nbsp; ]</td>
								<td class="p-0.5 border-slate-300 text-[8px] text-slate-400">........................</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Catatan Workshop & Tanda Tangan -->
				<div class="grid grid-cols-2 gap-2 mt-auto pt-1 border-t border-slate-300 text-[9px]">
					<!-- Disclaimer & TTD Pelanggan -->
					<div class="flex flex-col justify-between">
						<div class="text-[8px] text-slate-500 leading-tight">
							* Perangkat diserahkan untuk diservis sesuai keluhan. Nota/Job sheet wajib dibawa saat pengambilan unit.
						</div>
						<div class="mt-4 text-center">
							<div class="border-b border-dashed border-slate-500 h-8 w-32 mx-auto"></div>
							<div class="font-bold text-slate-800 mt-0.5">Tanda Tangan Pelanggan</div>
						</div>
					</div>

					<!-- TTD Teknisi / Admin -->
					<div class="flex flex-col justify-between items-end">
						<div class="text-[8px] text-slate-500 font-mono">
							Status: <b class="text-slate-900 uppercase">{{ ticket?.status || "DITERIMA" }}</b>
						</div>
						<div class="mt-4 text-center w-32">
							<div class="border-b border-dashed border-slate-500 h-8 w-32 mx-auto"></div>
							<div class="font-bold text-slate-800 mt-0.5">Teknisi / Workshop</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<template #footer>
			<n-space justify="end">
				<n-button secondary @click="handleClose">Tutup</n-button>
				<n-button type="primary" @click="handlePrint">
					<template #icon><Icon name="tabler:printer" :size="16" /></template>
					Cetak Job Sheet (A5)
				</n-button>
			</n-space>
		</template>
	</n-modal>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import axios from "axios"
import dayjs from "dayjs"
import JsBarcode from "jsbarcode"
import { NButton, NModal, NSpace } from "naive-ui"
import { computed, nextTick, ref, watch } from "vue"

const props = defineProps<{
	active: boolean
	ticket?: any
}>()

const emit = defineEmits<{
	(e: "closeModal"): void
}>()

const show = ref(false)
const barcodeSvg = ref<SVGElement | null>(null)
const storeVariables = ref<Record<string, string>>({})

const qcChecklistItems = [
	"LCD & Layar Tampilan (Display)",
	"Touchscreen / Layar Sentuh",
	"Kamera Depan & Kamera Belakang",
	"Speaker Suara, Buzzer & Microphone",
	"Port Charging / Pengisian Baterai",
	"Sinyal Seluler / SIM & WiFi / Bluetooth",
	"Tombol Fisik (Power & Volume)",
	"Sensor Wajah / Sidik Jari (FaceID / Fingerprint)"
]

const ticketCategories = computed(() => {
	if (!props.ticket) return []
	return props.ticket.service_categories || props.ticket.serviceCategories || []
})

const storeInfo = computed(() => {
	return {
		name: storeVariables.value.nama_toko || storeVariables.value.store_name || "WORKSHOP TOKO SERVIS HP",
		address: storeVariables.value.alamat_toko || storeVariables.value.store_address || "Layanan Perbaikan Smartphone Profesional",
		phone: storeVariables.value.nomor_wa_toko || storeVariables.value.store_phone || "0812-3456-7890"
	}
})

const formatDate = (val?: string) => {
	if (!val) return "-"
	return dayjs(val).format("YYYY-MM-DD HH:mm")
}

const renderBarcode = () => {
	if (!barcodeSvg.value || !props.ticket) return
	const code = props.ticket.ticket_number || `TCK-${props.ticket.id || 1}`
	try {
		JsBarcode(barcodeSvg.value, code, {
			format: "CODE128",
			displayValue: false,
			height: 32,
			margin: 0,
			lineColor: "#0f172a"
		})
	} catch (e) {
		console.warn("Barcode rendering error:", e)
	}
}

const fetchStoreVariables = async () => {
	try {
		const { data } = await axios.get("variables", { params: { all: 1 } })
		const items = data.data || data || []
		const map: Record<string, string> = {}
		items.forEach((item: any) => {
			if (item.name) {
				map[item.name] = item.value || ""
			}
		})
		storeVariables.value = map
	} catch (e) {
		// fallback to defaults
	}
}

watch(
	() => props.active,
	async val => {
		show.value = val
		if (val) {
			await fetchStoreVariables()
			await nextTick()
			renderBarcode()
		}
	}
)

const handleClose = () => {
	show.value = false
	emit("closeModal")
}

const handlePrint = () => {
	window.print()
}
</script>

<style scoped>
/* A5 Dimensions: 148mm width x 210mm height */
.job-sheet-container {
	width: 148mm;
	min-height: 210mm;
	max-height: 210mm;
	padding: 6mm 8mm;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	background: #ffffff !important;
	color: #0f172a !important;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

@media print {
	/* Hide everything except the job sheet print area */
	body * {
		visibility: hidden !important;
	}

	#job-sheet-print-area,
	#job-sheet-print-area * {
		visibility: visible !important;
	}

	#job-sheet-print-area {
		position: fixed !important;
		left: 0 !important;
		top: 0 !important;
		width: 148mm !important;
		height: 210mm !important;
		padding: 6mm 8mm !important;
		margin: 0 !important;
		box-shadow: none !important;
		border: none !important;
		background: #ffffff !important;
		color: #000000 !important;
		page-break-inside: avoid !important;
	}

	@page {
		size: A5 portrait;
		margin: 0;
	}
}
</style>
