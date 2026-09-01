<template>
	<div>
		<n-card title="Data Subdivisi">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-subdivision">
						<n-button type="primary" @click="showModal = true">
							<Icon :name="AddIcon" :size="20" />
							Tambah Data
						</n-button>
					</can>

					<n-space>
						<n-input v-model:value="searchQuery" clearable placeholder="Cari">
							<template #prefix>
								<Icon :name="SearchIcon" />
							</template>
						</n-input>
					</n-space>
				</n-space>

				<n-data-table
					ref="subdivisiDataTable"
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

<script setup>
import Can from "@/components/common/Can.vue"
import Icon from "@/components/common/Icon.vue"
import { renderIcon } from "@/utils"
import { can as canDo } from "@/utils/auth"
import axios from "axios"
import { debounce } from "lodash"
import { NButton, NCard, NDataTable, NDivider, NDropdown, NInput, NSpace, useDialog, useMessage } from "naive-ui"
import { h, onBeforeMount, reactive, ref, watch } from "vue"
import Modal from "./Modal.vue"
import { updateScreenMaxHeight } from "@/mixins"

const message = useMessage()
const dialog = useDialog()

const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"

const showModal = ref(false)
const loading = ref(false)
const scrollbarMaxHeight = updateScreenMaxHeight(360)

const columns = reactive([
	{
		title: "No",
		key: "key",
		align: "center",
		width: 50,
		fixed: "left",
		sorter: false,
		render: (_, index) => index + 1
	},
	{
		title: "Divisi",
		key: "division",
		align: "center",
		width: 150,
		sorter: false,
		render: row => row.division?.name ?? "-"
	},
	{
		title: "Nama Subdivisi",
		key: "name",
		align: "center",
		width: 180,
		sorter: true
	},
	{
		title: "Deskripsi",
		key: "description",
		align: "center",
		width: 200,
		ellipsis: { tooltip: true }
	},
	{
		title: "Action",
		key: "actions",
		align: "center",
		cursor: "pointer",
		width: 100,
		render(row) {
			return h(
				NDropdown,
				{
					trigger: "click",
					placement: "bottom",
					onSelect: handleDataAction(row),
					options: [
						canDo("update-subdivision") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-subdivision") && {
							label: "Delete",
							key: "action-delete",
							icon: () => h(Icon, { name: "tabler:trash" })
						}
					].filter(Boolean)
				},
				{ default: () => h(NButton, { size: "small", secondary: true }, renderIcon(MenuIcon)) }
			)
		}
	}
])

const tableData = ref([])
const paginationReactive = reactive({
	page: 1,
	pageCount: 1,
	pageSize: 10,
	showSizePicker: true,
	pageSizes: [10, 20, 30, 40, 50, 100, 200],
	dataCount: 0,
	sorter: {}
})
const pagination = ref(paginationReactive)
const searchQuery = ref("")
const modalData = ref({})

const fetchData = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("subdivisions", {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				sorter: paginationReactive.sorter,
				search: searchQuery.value
			}
		})
		tableData.value = data.data
		paginationReactive.dataCount = data.total
		paginationReactive.pageCount = data.last_page
		if (paginationReactive.page > paginationReactive.pageCount) {
			paginationReactive.page = 1
			fetchData()
		}
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
	loading.value = false
}

const handleSorterChange = sorter => {
	paginationReactive.sorter = sorter
	fetchData()
}

const handlePageChange = page => {
	paginationReactive.page = page
	fetchData()
}

const handlePageSizeChange = pageSize => {
	paginationReactive.pageSize = pageSize
	if (pageSize > paginationReactive.dataCount) paginationReactive.page = 1
	fetchData()
}

const handleCloseModal = (refresh = false) => {
	showModal.value = false
	modalData.value = {}
	if (refresh) fetchData()
}

const handleDataAction = row => key => {
	if (key === "action-edit") {
		modalData.value = { ...row }
		showModal.value = true
	} else if (key === "action-delete") {
		const d = dialog.warning({
			title: "Konfirmasi Penghapusan Data",
			content: "Apakah anda yakin ingin menghapus data ini?",
			positiveText: "Ya",
			negativeText: "Tidak",
			positiveButtonProps: { loading: false },
			onPositiveClick: () => {
				d.positiveButtonProps.loading = true
				return deleteData(row.id).catch(() => {
					d.positiveButtonProps.loading = false
					return false
				})
			}
		})
	}
}

const deleteData = async id => {
	try {
		const { data } = await axios.delete(`subdivisions/${id}`)
		message.success(data.message)
		fetchData()
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
}

watch(
	searchQuery,
	debounce(() => fetchData(), 500)
)

onBeforeMount(() => fetchData())
</script>
