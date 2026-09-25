<template>
	<div>
		<n-card title="Data Teknisi (Worker)">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-worker">
						<n-button type="primary" @click="openCreateModal">
							<template #icon>
								<Icon :name="AddIcon" :size="20" />
							</template>
							Tambah Teknisi
						</n-button>
					</can>

					<n-space>
						<n-input v-model:value="searchQuery" clearable placeholder="Cari nama teknisi...">
							<template #prefix>
								<Icon :name="SearchIcon" />
							</template>
						</n-input>
					</n-space>
				</n-space>

				<n-data-table
					ref="workerDataTable"
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
			</n-space>
		</n-card>

		<Modal :active="showModal" :data="modalData" @closeModal="handleCloseModal" />
	</div>
</template>

<script setup lang="ts">
import Can from "@/components/common/Can.vue"
import Icon from "@/components/common/Icon.vue"
import { updateScreenMaxHeight } from "@/mixins"
import { renderIcon } from "@/utils"
import { can as canDo } from "@/utils/auth"
import axios from "axios"
import { debounce } from "lodash"
import {
	NButton,
	NCard,
	NDataTable,
	NDivider,
	NDropdown,
	NInput,
	NSpace,
	NTag,
	NSwitch,
	useDialog,
	useMessage,
	type DataTableColumns
} from "naive-ui"
import { h, onBeforeMount, reactive, ref, watch } from "vue"
import Modal from "./Modal.vue"

const message = useMessage()
const dialog = useDialog()

const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"

const showModal = ref(false)
const loading = ref(false)
const modalData = ref<any>({})
const tableData = ref<any[]>([])
const searchQuery = ref("")
const scrollbarMaxHeight = updateScreenMaxHeight(360)

const paginationReactive = reactive({
	page: 1,
	pageCount: 1,
	pageSize: 10,
	showSizePicker: true,
	pageSizes: [10, 20, 30, 40, 50, 100, 200],
	dataCount: 0,
	sorter: {} as any
})
const pagination = ref(paginationReactive)

const columns = reactive<DataTableColumns<any>>([
	{
		title: "No",
		key: "key",
		align: "center",
		width: 60,
		render: (_, index) => {
			return (paginationReactive.page - 1) * paginationReactive.pageSize + index + 1
		}
	},
	{
		title: "Nama Teknisi",
		key: "name",
		sorter: true,
		width: 200
	},
	{
		title: "No. WhatsApp / HP",
		key: "phone",
		width: 180,
		render(row) {
			if (!row.phone) return "-"
			return h("a", {
				href: `https://wa.me/${row.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}`,
				target: "_blank",
				class: "text-blue-500 hover:underline flex items-center gap-1 font-mono text-xs"
			}, [
				h(Icon, { name: "tabler:brand-whatsapp", size: 14, color: "#22c55e" }),
				row.phone
			])
		}
	},
	{
		title: "Status",
		key: "is_active",
		align: "center",
		width: 140,
		render(row) {
			const isActive = Boolean(row.is_active)
			return h(
				NTag,
				{
					type: isActive ? "success" : "default",
					round: true,
					size: "small"
				},
				{ default: () => (isActive ? "Aktif" : "Nonaktif") }
			)
		}
	},
	{
		title: "Aksi",
		key: "actions",
		align: "center",
		width: 80,
		render(row) {
			return h(
				NDropdown,
				{
					trigger: "click",
					placement: "bottom",
					onSelect: (key: string) => handleDataAction(row, key),
					options: [
						canDo("update-worker") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-worker") && {
							label: "Hapus",
							key: "action-delete",
							icon: () => h(Icon, { name: "tabler:trash" })
						}
					].filter(Boolean) as any
				},
				{ default: () => h(NButton, { size: "small", secondary: true }, renderIcon(MenuIcon)) }
			)
		}
	}
])

const fetchData = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("workers", {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				sorter: paginationReactive.sorter,
				search: searchQuery.value
			}
		})

		tableData.value = data.data || []
		paginationReactive.dataCount = data.total || 0
		paginationReactive.pageCount = data.last_page || 1
		if (paginationReactive.page > paginationReactive.pageCount) {
			paginationReactive.page = 1
			fetchData()
		}
	} catch (error: any) {
		message.error(error.response?.data?.message || error.message || "Gagal memuat data teknisi")
	} finally {
		loading.value = false
	}
}

const openCreateModal = () => {
	modalData.value = {}
	showModal.value = true
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

const handleCloseModal = (refresh = false) => {
	showModal.value = false
	modalData.value = {}
	if (refresh) {
		fetchData()
	}
}

const handleDataAction = (row: any, key: string) => {
	if (key === "action-edit") {
		modalData.value = { ...row }
		showModal.value = true
	} else if (key === "action-delete") {
		const d = dialog.warning({
			title: "Hapus Data Teknisi",
			content: `Apakah Anda yakin ingin menghapus teknisi "${row.name}"?`,
			positiveText: "Hapus",
			negativeText: "Batal",
			positiveButtonProps: { type: "error" },
			onPositiveClick: async () => {
				d.loading = true
				try {
					const { data } = await axios.delete(`workers/${row.id}`)
					message.success(data.message || "Teknisi berhasil dihapus")
					fetchData()
				} catch (error: any) {
					message.error(error.response?.data?.message || error.message || "Gagal menghapus teknisi")
				} finally {
					d.loading = false
				}
			}
		})
	}
}

watch(
	searchQuery,
	debounce(() => {
		paginationReactive.page = 1
		fetchData()
	}, 400)
)

onBeforeMount(() => {
	fetchData()
})
</script>
