<template>
	<div>
		<n-card title="Data Artikel">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-article">
						<n-button type="primary" @click="showModal = true">
							<Icon :name="AddIcon" :size="20" />
							Tambah Artikel
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
									<Icon :name="FilterSearchIcon" :size="20" />
									Filter
								</n-button>
							</template>

							<n-form-item class="mb-3" label="Status" :show-feedback="false">
								<n-select
									v-model:value="filterValues.status"
									clearable
									:options="filterItems.statusOptions"
									placeholder="Pilih Status"
								/>
							</n-form-item>
							<n-form-item label="Type" :show-feedback="false">
								<n-select
									v-model:value="filterValues.type"
									clearable
									:options="filterItems.typeOptions"
									placeholder="Pilih Type"
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
					ref="artikelDataTable"
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

const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"
const FilterSearchIcon = "carbon:search-locate"

const showModal = ref(false)
const loading = ref(false)
const scrollbarMaxHeight = updateScreenMaxHeight(360)

const statusLabel = s => {
	if (s === "draft") return "Draft"
	if (s === "published") return "Published"
	if (s === "archived") return "Archived"
	return s
}

const statusType = s => {
	if (s === "draft") return "default"
	if (s === "published") return "success"
	if (s === "archived") return "warning"
	return "default"
}

const articleTypeTag = t => {
	if (t === "Event") return "warning"
	if (t === "Info") return "info"
	return "default"
}

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
		title: "Thumbnail",
		key: "thumbnail",
		align: "center",
		width: 80,
		render(row) {
			if (!row.thumbnail) return "-"
			const imgSrc = row.thumbnail.startsWith("http")
				? row.thumbnail
				: (import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL) + row.thumbnail
			return h(NImage, {
				src: imgSrc,
				width: 60,
				height: 60,
				style: { "object-fit": "cover", "border-radius": "4px" }
			})
		}
	},
	{
		title: "Title",
		key: "title",
		width: 180,
		ellipsis: { tooltip: true },
		titleAlign: "center"
	},
	{
		title: "Slug",
		key: "slug",
		align: "center",
		width: 150,
		ellipsis: { tooltip: true }
	},
	{
		title: "Type",
		key: "type",
		align: "center",
		width: 110,
		render(row) {
			return h(NTag, { round: true, type: articleTypeTag(row.type) }, () => row.type || "-")
		}
	},
	{
		title: "Status",
		key: "status",
		align: "center",
		width: 100,
		render(row) {
			return h(NTag, { round: true, type: statusType(row.status) }, () => statusLabel(row.status))
		}
	},
	{
		title: "Tanggal Dibuat",
		key: "created_at",
		align: "center",
		width: 120,
		sorter: true,
		render: row => formatDateID(row.created_at)
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
						canDo("update-article") && {
							label: "Edit",
							key: "action-edit",
							icon: () => h(Icon, { name: "tabler:pencil" })
						},
						canDo("delete-article") && {
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
const filterValues = ref({ status: null, type: null })
const filterItems = ref({
	statusOptions: [
		{ value: "draft", label: "Draft" },
		{ value: "published", label: "Published" },
		{ value: "archived", label: "Archived" }
	],
	typeOptions: [
		{ value: "Event", label: "Event" },
		{ value: "Info", label: "Info" }
	]
})

const modalData = ref({})

const fetchData = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("articles", {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				sorter: paginationReactive.sorter,
				search: searchQuery.value,
				filters: {
					status: filterValues.value.status,
					type: filterValues.value.type
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
		const { data } = await axios.delete(`articles/${id}`)
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
