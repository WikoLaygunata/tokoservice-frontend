<template>
	<div class="space-y-4">
		<AnalyticsHeader v-model:date-preset="datePreset" :loading="loading" @refresh="() => fetchData(true)" />
		<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60" title="Matriks Performa & Efisiensi Pengerjaan Teknisi">
			<n-spin :show="loading">
				<div v-if="items.length === 0" class="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Belum ada data pengerjaan teknisi pada periode ini.</div>
				<n-data-table v-else :columns="columns" :data="items" :single-column="true" :single-line="false" size="small" />
			</n-spin>
		</n-card>
	</div>
</template>
<script setup lang="ts">
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import { NCard, NDataTable, NSpin, NTag, useMessage, type DataTableColumns } from "naive-ui"
import { h, ref, watch } from "vue"
const store = useAnalyticsStore(); const message = useMessage(); const loading = ref(false); const datePreset = ref("this_month"); const items = ref<any[]>([])
const columns: DataTableColumns<any> = [
	{ title: "No", key: "idx", width: 50, align: "center", render: (_, index) => index + 1 },
	{ title: "Nama Teknisi", key: "name", render: row => h("div", [h("div", { class: "font-bold text-slate-800 dark:text-slate-100" }, row.name), row.phone ? h("div", { class: "text-xs text-slate-500" }, row.phone) : null]) },
	{ title: "Status", key: "is_active", align: "center", render: row => h(NTag, { size: "small", type: row.is_active ? "success" : "default" }, { default: () => row.is_active ? "Aktif" : "Nonaktif" }) },
	{ title: "Ditugaskan", key: "total_assigned", align: "center" }, { title: "Selesai", key: "total_completed", align: "center" }, { title: "Batal", key: "total_cancelled", align: "center" }, { title: "Sedang Dikerjakan", key: "total_in_progress", align: "center" }, { title: "Success Rate", key: "success_rate", align: "center", render: row => `${row.success_rate || 0}%` }, { title: "Rata-rata Waktu", key: "avg_duration_minutes", align: "center", render: row => row.avg_duration_minutes > 0 ? `${row.avg_duration_minutes} mnt` : "-" }
]
const fetchData = async (forceRefresh = false) => { loading.value = true; try { const result = await store.fetchWorkers({ date_preset: datePreset.value || undefined }, forceRefresh); items.value = result.data || [] } catch (error: any) { message.error(error.response?.data?.message || error.message || "Gagal memuat analitik teknisi") } finally { loading.value = false } }
watch(datePreset, () => fetchData()); fetchData()
</script>
