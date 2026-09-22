<template>
	<div>
		<n-card title="Data Template WhatsApp (WA Template)">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-wa_template">
						<n-button type="primary" @click="openCreateModal">
							<template #icon>
								<Icon :name="AddIcon" :size="20" />
							</template>
							Tambah Template WA
						</n-button>
					</can>

					<n-space>
						<n-input v-model:value="searchQuery" clearable placeholder="Cari judul / isi template...">
							<template #prefix>
								<Icon :name="SearchIcon" />
							</template>
						</n-input>
					</n-space>
				</n-space>

				<n-data-table
					ref="waTemplateDataTable"
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
	pageSizes: [10, 20, 30, 50],
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
		title: "Judul Template",
		key: "title",
		sorter: true,
		width: 220
	},
	{
		title: "Isi Format Pesan",
		key: "content",
		ellipsis: { tooltip: true },
		render(row) {
			return h("span", { class: "font-mono text-xs opacity-90" }, row.content || "-")
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
						canDo("update-wa_template") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-wa_template") && {
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
		const { data } = await axios.get("wa-templates", {
			params: {
				page: paginationReactive.page,
				per_page: paginationReactive.pageSize,
				sort_by: paginationReactive.sorter?.field,
				sort_order: paginationReactive.sorter?.order === "ascend" ? "asc" : paginationReactive.sorter?.order === "descend" ? "desc" : undefined,
				search: searchQuery.value
			}
		})

		tableData.value = data.data || []
		paginationReactive.dataCount = data.total || 0
		paginationReactive.pageCount = data.last_page || 1
	} catch (error: any) {
		message.error(error.response?.data?.message || error.message || "Gagal memuat data template WA")
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
			title: "Hapus Template WhatsApp",
			content: `Apakah Anda yakin ingin menghapus template "${row.title}"?`,
			positiveText: "Hapus",
			negativeText: "Batal",
			positiveButtonProps: { type: "error" },
			onPositiveClick: async () => {
				d.loading = true
				try {
					const { data } = await axios.delete(`wa-templates/${row.id}`)
					message.success(data.message || "Template WA berhasil dihapus")
					fetchData()
				} catch (error: any) {
					message.error(error.response?.data?.message || error.message || "Gagal menghapus template WA")
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
