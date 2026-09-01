<template>
	<div>
		<n-card title="Data User">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-user">
						<n-button type="primary" @click="showDrawer = true">
							<Icon :name="AddIcon" :size="20"></Icon>
							Tambah Data
						</n-button>
					</can>

					<n-space>
						<n-input v-model:value="searchQuery" clearable placeholder="Cari">
							<template #prefix>
								<Icon :name="SearchIcon" />
							</template>
						</n-input>
						<n-popover
							v-model:show="showFilter"
							placement="bottom-end"
							style="width: 250px"
							trigger="manual"
						>
							<template #trigger>
								<n-button @click="showFilter = !showFilter">
									<Icon :name="FilterSearchIcon" :size="20"></Icon>
									Filter
								</n-button>
							</template>

							<n-form-item class="mb-3" label="Role" :show-feedback="false">
								<n-select
									v-model:value="filterValues.role"
									clearable
									:options="filterItems.roles"
									placeholder="Pilih Role"
								/>
							</n-form-item>

							<n-space class="mt-5" justify="end">
								<n-button class="mr-2" secondary @click="showFilter = false">Tutup</n-button>
								<n-button type="primary" @click="fetchData">Terapkan</n-button>
							</n-space>
						</n-popover>
					</n-space>
				</n-space>

				<n-data-table
					ref="usersDataTable"
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
import { useAuthStore } from "@/stores/auth"
import { useSelectOptionsStore } from "@/stores/selectOptions"
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
	NFormItem,
	NInput,
	NPopover,
	NSelect,
	NSpace,
	NTag,
	useDialog,
	useMessage
} from "naive-ui"
import { h, onBeforeMount, reactive, ref, watch } from "vue"
import Drawer from "./Drawer.vue"
import { updateScreenMaxHeight } from "@/mixins"

// Auth
const userData = useAuthStore()

// Utils
const message = useMessage()
const dialog = useDialog()
const selectOptionsStore = useSelectOptionsStore()

// Icons
const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"
const FilterSearchIcon = "carbon:search-locate"

// States
const showDrawer = ref(false)
const loading = ref(false)

// Layout
const scrollbarMaxHeight = updateScreenMaxHeight(360) // Adjust the offset as needed

// Table columns
const columns = reactive([
	{
		title: "No",
		key: "key",
		align: "center",
		width: 50,
		fixed: "left",
		sorter: false,
		render: (_, index) => {
			return index + 1
		}
	},
	{
		title: "Nama",
		key: "name",
		align: "center",
		width: 100,
		sorter: true
	},
	{
		title: "Role",
		key: "role.title",
		align: "center",
		width: 100
	},
	{
		title: "Username",
		key: "username",
		align: "center",
		width: 100,
		sorter: true
	},
	{
		title: "Status",
		key: "is_active",
		align: "center",
		width: 100,
		sorter: true,
		render(row) {
			return h(
				NTag,
				{
					round: true,
					type: row.is_active ? "success" : "error"
				},
				() => (row.is_active ? "Aktif" : "Tidak Aktif")
			)
		}
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
						canDo("update-user") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-user") && {
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

// Filter properties
const showFilter = ref(false)
const filterValues = ref({
	role: null
})
const filterItems = ref({
	roles: []
})

// Drawer data
const drawerData = ref({})

// Methods
const fetchData = async () => {
	loading.value = true

	try {
		const { data } = await axios.get(`users`, {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				sorter: paginationReactive.sorter,
				search: searchQuery.value,
				filters: {
					"role.name": filterValues.value.role
				}
			}
		})

		if (userData.user.id !== 1 && userData.user.id !== 2) {
			columns.splice(10, 1)
		}

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

const fetchRoles = async () => {
	try {
		await selectOptionsStore.ensureOptions("roles")
		filterItems.value.roles = selectOptionsStore.getOptions("roles")
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
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
		const { role, ...data } = row
		drawerData.value = {
			...data,
			role: role.name.toString()
		}

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
		const { data } = await axios.delete(`users/${id}`)

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
	fetchRoles()
})
</script>
