<template>
	<div class="space-y-4">
		<AnalyticsHeader v-model:date-preset="datePreset" :loading="loading" @refresh="() => fetchData(true)" />
		<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60" title="Rekam Jejak Aktivitas Pengguna (Audit Trail Log)">
			<div class="mb-4 max-w-md">
				<n-input v-model:value="search" clearable placeholder="Cari user, aksi, atau deskripsi..." />
			</div>
			<n-spin :show="loading">
				<n-data-table
					:columns="columns"
					:data="items"
					:single-column="true"
					:single-line="false"
					size="small"
				/>
			</n-spin>
			<div class="mt-4 flex justify-end">
				<n-pagination
					v-model:page="pagination.page"
					v-model:page-size="pagination.pageSize"
					:item-count="pagination.dataCount"
					:page-sizes="pagination.pageSizes"
					show-size-picker
				/>
			</div>
		</n-card>
	</div>
</template>
<script setup lang="ts">
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import { NCard, NDataTable, NInput, NPagination, NSpin, NTag, useMessage, type DataTableColumns } from "naive-ui"
import dayjs from "dayjs"
import { debounce } from "lodash"
import { h, reactive, ref, watch } from "vue"

const store = useAnalyticsStore()
const message = useMessage()
const loading = ref(false)
const datePreset = ref("this_month")
const search = ref("")
const items = ref<any[]>([])
const pagination = reactive({
	page: 1,
	pageSize: 20,
	dataCount: 0,
	pageSizes: [20, 50, 100]
})
const columns: DataTableColumns<any> = [
	{ title: "No", key: "idx", width: 50, align: "center", render: (_, index) => (pagination.page - 1) * pagination.pageSize + index + 1 },
	{ title: "Waktu", key: "created_at", render: row => dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss") },
	{ title: "User", key: "user_name", render: row => row.user_name || "Sistem" },
	{ title: "Aksi", key: "action", render: row => h(NTag, { size: "small", type: "info" }, { default: () => row.action }) },
	{ title: "Deskripsi", key: "description" }
]

const fetchData = async (forceRefresh = false) => {
	loading.value = true
	try {
		const result = await store.fetchActivityLogs({
			search: search.value || undefined,
			page: pagination.page,
			pageSize: pagination.pageSize
		}, forceRefresh)
		items.value = result.data || []
		pagination.dataCount = result.total || 0
		if (pagination.page > (result.last_page || 1)) {
			pagination.page = 1
		}
	} catch (error: any) {
		message.error(error.response?.data?.message || error.message || "Gagal memuat audit trail")
	} finally {
		loading.value = false
	}
}

watch([() => pagination.page, () => pagination.pageSize], () => fetchData())
watch(search, debounce(() => {
	pagination.page = 1
	fetchData()
}, 400))
fetchData()
</script>
