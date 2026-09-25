<template>
	<div class="space-y-4">
		<AnalyticsHeader v-model:date-preset="datePreset" :loading="loading" @refresh="() => fetchData(true)" />
		<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60" title="Rekap Kunjungan & Loyalitas Pelanggan">
			<div class="mb-4 max-w-sm"><n-input v-model:value="search" clearable placeholder="Cari pelanggan..." /></div>
			<n-spin :show="loading"><n-data-table :columns="columns" :data="items" :single-column="true" :single-line="false" size="small" /></n-spin>
		</n-card>
	</div>
</template>
<script setup lang="ts">
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import { NCard, NDataTable, NInput, NSpin, useMessage, type DataTableColumns } from "naive-ui"
import dayjs from "dayjs"
import { debounce } from "lodash"
import { ref, watch } from "vue"
const store = useAnalyticsStore(); const message = useMessage(); const loading = ref(false); const datePreset = ref("this_month"); const search = ref(""); const items = ref<any[]>([])
const columns: DataTableColumns<any> = [{ title: "No", key: "idx", width: 50, align: "center", render: (_, index) => index + 1 }, { title: "Nama Pelanggan", key: "name" }, { title: "No. WhatsApp / HP", key: "phone" }, { title: "Alamat", key: "address", ellipsis: { tooltip: true } }, { title: "Total Unit Diservis", key: "total_tickets", align: "center" }, { title: "Unit Selesai", key: "total_completed", align: "center" }, { title: "Kunjungan Terakhir", key: "last_service_at", render: row => row.last_service_at ? dayjs(row.last_service_at).format("YYYY-MM-DD") : "-" }]
const fetchData = async (forceRefresh = false) => { loading.value = true; try { const result = await store.fetchCustomerHistory({ search: search.value || undefined, date_preset: datePreset.value || undefined }, forceRefresh); items.value = result.data || [] } catch (error: any) { message.error(error.response?.data?.message || error.message || "Gagal memuat histori pelanggan") } finally { loading.value = false } }
watch(datePreset, () => fetchData()); watch(search, debounce(() => fetchData(), 400)); fetchData()
</script>
