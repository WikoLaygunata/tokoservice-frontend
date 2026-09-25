<template>
	<div class="space-y-4">
		<AnalyticsHeader v-model:date-preset="datePreset" :loading="loading" @refresh="() => fetchData(true)" />
		<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60" title="Ranking Penggunaan Sparepart & Jasa Servis">
			<n-spin :show="loading">
				<div v-if="items.length === 0" class="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Belum ada data penggunaan sparepart pada periode ini.</div>
				<div v-else class="space-y-4">
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
							<div class="text-xs text-slate-500 dark:text-slate-400">Total Kategori Digunakan</div>
							<div class="mt-1 text-2xl font-black font-mono text-slate-900 dark:text-white">{{ totalCategories }}</div>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
							<div class="text-xs text-slate-500 dark:text-slate-400">Total Kuantitas Terpakai</div>
							<div class="mt-1 text-2xl font-black font-mono text-emerald-500">{{ totalQuantity }} Pcs</div>
						</div>
						<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
							<div class="text-xs text-slate-500 dark:text-slate-400">Rekomendasi Restock Teratas</div>
							<div class="mt-1 truncate text-base font-bold text-sky-500">{{ items[0]?.name || "-" }}</div>
						</div>
					</div>
					<n-data-table :columns="columns" :data="items" :single-column="true" :single-line="false" size="small" />
				</div>
			</n-spin>
		</n-card>
	</div>
</template>

<script setup lang="ts">
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import { NCard, NDataTable, NSpin, useMessage, type DataTableColumns } from "naive-ui"
import { h, ref, watch } from "vue"

const store = useAnalyticsStore()
const message = useMessage()
const loading = ref(false)
const datePreset = ref("this_month")
const items = ref<any[]>([])
const totalCategories = ref(0)
const totalQuantity = ref(0)
const columns: DataTableColumns<any> = [
	{ title: "No", key: "idx", width: 50, align: "center", render: (_, index) => index + 1 },
	{ title: "Nama Sparepart / Kategori Jasa", key: "name", width: 250, render: row => h("span", { class: "font-bold text-slate-800 dark:text-slate-100" }, row.name) },
	{ title: "Total Qty Terpakai", key: "total_quantity", align: "center", render: row => `${row.total_quantity} Pcs` },
	{ title: "Total Tiket", key: "total_tickets", align: "center", render: row => `${row.total_tickets} Tiket` },
	{ title: "Pangsa Penggunaan (%)", key: "percentage", align: "center", render: row => `${row.percentage}%` }
]

const fetchData = async (forceRefresh = false) => {
	loading.value = true
	try {
		const result = await store.fetchSpareparts({ date_preset: datePreset.value || undefined }, forceRefresh)
		items.value = result.data || []
		totalCategories.value = result.total_categories_used || 0
		totalQuantity.value = result.total_quantity_sum || 0
	} catch (error: any) {
		message.error(error.response?.data?.message || error.message || "Gagal memuat analitik sparepart")
	} finally {
		loading.value = false
	}
}

watch(datePreset, () => fetchData())
fetchData()
</script>
