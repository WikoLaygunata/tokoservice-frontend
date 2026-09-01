<template>
	<div>
		<n-card title="Data Variable">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-variable">
						<n-button type="primary" @click="showModal = true">
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
					</n-space>
				</n-space>

				<n-data-table
					ref="variableDataTable"
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
import {
	NButton,
	NCard,
	NDataTable,
	NDivider,
	NDropdown,
	NInput,
	NSpace,
	NImage,
	useDialog,
	useMessage
} from "naive-ui"
import { h, onBeforeMount, reactive, ref, watch } from "vue"
import Modal from "./Modal.vue"
import { updateScreenMaxHeight } from "@/mixins"

// Utils
const message = useMessage()
const dialog = useDialog()

// Icons
const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"

// States
const showModal = ref(false)
const loading = ref(false)

// Layout
const scrollbarMaxHeight = updateScreenMaxHeight(360)

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
		title: "Value",
		key: "value",
		align: "center",
		width: 120,
		ellipsis: { tooltip: true }
	},
	{
		title: "Gambar",
		key: "image_path",
		align: "center",
		width: 100,
		render(row) {
			if (!row.image_path) return "-"
			const imgSrc = row.image_path.startsWith("http")
				? row.image_path
				: import.meta.env.VITE_IMAGE_BASE_URL + row.image_path
			return h(NImage, {
				src: imgSrc,
				width: 80,
				height: 80,
				style: { "object-fit": "cover", "border-radius": "4px" }
			})
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
						canDo("update-variable") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-variable") && {
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

// Modal data
const modalData = ref({})

// Methods
const fetchData = async () => {
	loading.value = true

	try {
		const { data } = await axios.get("variables", {
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

	if (pageSize > paginationReactive.dataCount) {
		paginationReactive.page = 1
	}

	fetchData()
}

const handleCloseModal = (refresh = false) => {
	showModal.value = false
	modalData.value = {}

	if (refresh) {
		fetchData()
	}
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
		const { data } = await axios.delete(`variables/${id}`)

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
