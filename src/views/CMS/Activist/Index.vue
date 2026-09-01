<template>
	<div>
		<n-card title="Data Aktivis">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-activist">
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
						<n-popover
							v-model:show="showFilter"
							placement="bottom-end"
							style="width: 260px"
							trigger="manual"
						>
							<template #trigger>
								<n-button @click="showFilter = !showFilter">
									<Icon :name="FilterSearchIcon" :size="20" />
									Filter
								</n-button>
							</template>

							<n-form-item class="mb-3" label="Subdivisi" :show-feedback="false">
								<n-select
									v-model:value="filterValues.subdivision_id"
									clearable
									filterable
									:loading="loadingSubdivisions"
									:options="subdivisionOptions"
									placeholder="Pilih Subdivisi"
								/>
							</n-form-item>

							<n-form-item class="mb-3" label="Status" :show-feedback="false">
								<n-select
									v-model:value="filterValues.is_active"
									clearable
									:options="filterItems.statusOptions"
									placeholder="Pilih Status"
								/>
							</n-form-item>

							<n-space class="mt-5" justify="end">
								<n-button secondary @click="showFilter = false">Tutup</n-button>
								<n-button type="primary" @click="fetchData">Terapkan</n-button>
							</n-space>
						</n-popover>
					</n-space>
				</n-space>

				<n-data-table
					ref="activistDataTable"
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

		<Modal
			:active="showModal"
			:data="modalData"
			:subdivision-options="subdivisionOptions"
			@closeModal="handleCloseModal"
		/>
	</div>
</template>

<script setup>
import Can from "@/components/common/Can.vue"
import Icon from "@/components/common/Icon.vue"
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
	NImage,
	NInput,
	NPopover,
	NSelect,
	NSpace,
	NTag,
	useDialog,
	useMessage
} from "naive-ui"
import { h, onBeforeMount, reactive, ref, watch } from "vue"
import Modal from "./Modal.vue"
import { updateScreenMaxHeight } from "@/mixins"
import { formatDateID } from "@/mixins"

const message = useMessage()
const dialog = useDialog()
const selectOptionsStore = useSelectOptionsStore()

const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"
const FilterSearchIcon = "carbon:search-locate"

const showModal = ref(false)
const loading = ref(false)
const loadingSubdivisions = ref(false)
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
		title: "Gambar",
		key: "image_path",
		align: "center",
		width: 100,
		render(row) {
			if (!row.image_path) return "-"
			const imgSrc = row.image_path.startsWith("http")
				? row.image_path
				: (import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL) + row.image_path
			return h(NImage, {
				src: imgSrc,
				width: 80,
				height: 80,
				style: { "object-fit": "cover", "border-radius": "4px" }
			})
		}
	},
	{
		title: "Subdivisi",
		key: "subdivision.name",
		align: "center",
		width: 180,
		sorter: true,
		render: row => row.subdivision?.name ?? "-"
	},
	{
		title: "Nama",
		key: "name",
		align: "center",
		width: 180,
		sorter: true
	},
	{
		title: "Tahun",
		key: "year",
		align: "center",
		width: 100,
		sorter: true
	},
	{
		title: "Tanggal Dibuat",
		key: "created_at",
		align: "center",
		width: 140,
		sorter: true,
		render: row => (row.created_at ? formatDateID(row.created_at) : "-")
	},
	{
		title: "Status",
		key: "is_active",
		align: "center",
		width: 100,
		render(row) {
			return h(NTag, { round: true, type: row.is_active ? "success" : "error" }, () =>
				row.is_active ? "Aktif" : "Tidak Aktif"
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
						canDo("update-activist") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-activist") && {
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

const showFilter = ref(false)
const filterValues = ref({ subdivision_id: null, is_active: null })
const filterItems = ref({
	statusOptions: [
		{ value: 1, label: "Aktif" },
		{ value: 0, label: "Tidak Aktif" }
	]
})
const subdivisionOptions = ref([])
const modalData = ref({})

const fetchSubdivisions = async () => {
	loadingSubdivisions.value = true
	try {
		await selectOptionsStore.ensureOptions("subdivisions")
		subdivisionOptions.value = selectOptionsStore.getOptions("subdivisions")
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
	loadingSubdivisions.value = false
}

const fetchData = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("activists", {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				sorter: paginationReactive.sorter,
				search: searchQuery.value,
				filters: {
					subdivision_id: filterValues.value.subdivision_id,
					is_active: filterValues.value.is_active
				}
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
		const { data } = await axios.delete(`activists/${id}`)
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

onBeforeMount(() => {
	fetchSubdivisions()
	fetchData()
})
</script>
