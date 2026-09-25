<template>
	<div class="space-y-4">
		<AnalyticsHeader v-model:date-preset="datePreset" :loading="loading" @refresh="() => fetchData(true)" />
		<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60" title="Pangsa Pasar Merek Smartphone Masuk Servis">
			<n-spin :show="loading">
				<div v-if="items.length === 0" class="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Belum ada data merek smartphone pada periode ini.</div>
				<div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div class="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30">
						<h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Persentase Per Merek (Total: {{ totalUnits }} Unit)</h3>
						<div v-for="item in items" :key="item.id" class="space-y-1.5">
							<div class="flex items-center justify-between text-xs">
								<span class="font-bold text-slate-800 dark:text-slate-100">{{ item.name }}</span>
								<span class="font-mono text-sky-500">{{ item.total_units }} Unit ({{ item.percentage }}%)</span>
							</div>
							<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/60"><div class="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" :style="{ width: `${item.percentage}%` }"></div></div>
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
import { ref, watch } from "vue"
const store = useAnalyticsStore()
const message = useMessage()
const loading = ref(false)
const datePreset = ref("this_month")
const items = ref<any[]>([])
const totalUnits = ref(0)
const columns: DataTableColumns<any> = [
	{ title: "No", key: "idx", width: 50, align: "center", render: (_, index) => index + 1 },
	{ title: "Merek HP", key: "name", width: 200 },
	{ title: "Total Unit Masuk", key: "total_units", align: "center", width: 150 },
	{ title: "Persentase", key: "percentage", align: "center", width: 120, render: row => `${row.percentage}%` }
]
const fetchData = async (forceRefresh = false) => {
	loading.value = true
	try {
		const result = await store.fetchPhoneBrands({ date_preset: datePreset.value || undefined }, forceRefresh)
		items.value = result.data || []
		totalUnits.value = result.total_units_sum || 0
	} catch (error: any) { message.error(error.response?.data?.message || error.message || "Gagal memuat analitik merek") }
	finally { loading.value = false }
}
watch(datePreset, () => fetchData())
fetchData()
</script>
