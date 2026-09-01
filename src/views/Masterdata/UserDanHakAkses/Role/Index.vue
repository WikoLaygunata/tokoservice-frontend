<template>
	<div>
		<n-card title="Data Role / Jabatan">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-role">
						<n-button type="primary" @click="showDrawer = true">
							<Icon :name="AddIcon" :size="20"></Icon>
							Tambah Data
						</n-button>
					</can>

					<n-input v-model:value="searchQuery" clearable placeholder="Cari">
						<template #prefix>
							<Icon :name="SearchIcon" />
						</template>
					</n-input>
				</n-space>

				<n-data-table
					ref="rolesDataTable"
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

		<Drawer :active="showDrawer" :data="drawerData" @closeDrawer="handleCloseDrawer" />
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
import Drawer from "./Drawer.vue"
import { updateScreenMaxHeight } from "@/mixins"

// Utils
const message = useMessage()
const dialog = useDialog()

// Icons
const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"

// States
const showDrawer = ref(false)
const loading = ref(false)

// Layout
const scrollbarMaxHeight = updateScreenMaxHeight(360) // Adjust the offset as needed

// Table columns
const columns = [
	{
		title: "No",
		key: "key",
		align: "center",
		fixed: "left",
		width: 50,
		sorter: false,
		render: (_, index) => {
			return index + 1
		}
	},
	{
		title: "Nama Role / Jabatan",
		key: "title",
		align: "center",
		sorter: true
	},
	{
		title: "Action",
		key: "actions",
		align: "center",
		cursor: "pointer",
		width: 80,
		render(row) {
			return h(
				NDropdown,
				{
					trigger: "click",
					placement: "bottom",
					onSelect: handleDataAction(row),
					options: [
						canDo("update-role") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-role") && {
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
]

// Table properties
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

// Drawer data
const drawerData = ref({})

// Methods
const fetchData = async () => {
	loading.value = true

	try {
		const { data } = await axios.get(`roles`, {
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
			fetchOngoingData()
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

	if (pageSize > paginationReactive.dataCount) {
		paginationReactive.page = 1
	}

	fetchData()
}

const handleCloseDrawer = (refresh = false) => {
	showDrawer.value = false
	drawerData.value = {}

	if (refresh) {
		fetchData()
	}
}

const handleDataAction = row => key => {
	if (key === "action-edit") {
		drawerData.value = row
		showDrawer.value = true
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
		const { data } = await axios.delete(`roles/${id}`)

		message.success(data.message)
		fetchData()
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
}

// Watchers
watch(
	searchQuery,
	debounce(() => fetchData(), 500)
)

// Lifecycle
onBeforeMount(() => {
	fetchData()
})
</script>
