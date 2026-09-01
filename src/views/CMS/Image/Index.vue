<template>
	<div>
		<n-card title="Data Image">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space justify="space-between">
					<can permission="create-image">
						<n-button type="primary" @click="showModal = true">
							<Icon :name="AddIcon" :size="20" />
							Tambah Gambar
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

				<n-spin :show="loading">
					<n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="16" :y-gap="16">
						<n-gi v-for="image in images" :key="image.id">
							<n-card class="image-card" hoverable>
								<n-image
									object-fit="contain"
									:src="imageSrc(image.image_path)"
									style="
										height: 200px;
										width: 100%;
										display: flex;
										justify-content: center;
										border-radius: 4px;
									"
								/>
								<div class="image-card__meta">
									<div class="image-card__title" :title="image.image_path">
										{{ image.image_path }}
									</div>
									<n-ellipsis v-if="image.description" class="image-card__desc" :line-clamp="2">
										{{ image.description }}
									</n-ellipsis>
								</div>
								<div class="image-card__footer">
									<n-button quaternary size="small" @click="copyLink(image)">
										<Icon :name="CopyIcon" :size="14" />
										Copy link address
									</n-button>
									<n-dropdown
										:options="getActionOptions(image)"
										placement="bottom-end"
										trigger="click"
										@select="key => handleDataAction(image, key)"
									>
										<n-button circle quaternary size="small">
											<Icon :name="MenuIcon" :size="18" />
										</n-button>
									</n-dropdown>
								</div>
							</n-card>
						</n-gi>
					</n-grid>
				</n-spin>

				<n-empty v-if="!loading && images.length === 0" description="Belum ada gambar" />

				<div v-if="!loading && paginationReactive.dataCount > 0" class="mt-4 flex justify-end">
					<n-pagination
						:item-count="paginationReactive.dataCount"
						:page="paginationReactive.page"
						:page-size="paginationReactive.pageSize"
						:page-sizes="paginationReactive.pageSizes"
						show-size-picker
						@update:page="handlePageChange"
						@update:page-size="handlePageSizeChange"
					/>
				</div>
			</n-space>
		</n-card>

		<Modal :active="showModal" :data="modalData" @closeModal="handleCloseModal" />
	</div>
</template>

<script setup>
import Can from "@/components/common/Can.vue"
import Icon from "@/components/common/Icon.vue"
import { can as canDo } from "@/utils/auth"
import axios from "axios"
import { debounce } from "lodash"
import {
	NButton,
	NCard,
	NDivider,
	NDropdown,
	NEllipsis,
	NGi,
	NGrid,
	NImage,
	NEmpty,
	NPagination,
	NInput,
	NSpace,
	NSpin,
	useDialog,
	useMessage
} from "naive-ui"
import { h, onBeforeMount, reactive, ref, watch } from "vue"
import Modal from "./Modal.vue"

const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const MenuIcon = "carbon:overflow-menu-vertical"
const CopyIcon = "tabler:link"

const message = useMessage()
const dialog = useDialog()

const showModal = ref(false)
const loading = ref(false)
const images = ref([])
const searchQuery = ref("")

const paginationReactive = reactive({
	page: 1,
	pageCount: 1,
	pageSize: 12,
	pageSizes: [12, 24, 36, 48],
	dataCount: 0
})

const modalData = ref({})

function imageSrc(path) {
	if (!path) return ""
	return path.startsWith("http")
		? path
		: (import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL) + path
}

const fetchData = async () => {
	loading.value = true
	try {
		const { data } = await axios.get("images", {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				search: searchQuery.value
			}
		})
		images.value = data.data
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

const handlePageChange = page => {
	paginationReactive.page = page
	fetchData()
}

const handlePageSizeChange = pageSize => {
	paginationReactive.pageSize = pageSize
	if (pageSize > paginationReactive.dataCount) paginationReactive.page = 1
	fetchData()
}

const getActionOptions = () =>
	[
		canDo("update-image") && {
			label: "Edit",
			key: "action-edit",
			icon: () => h(Icon, { name: "tabler:pencil" })
		},
		canDo("delete-image") && {
			label: "Delete",
			key: "action-delete",
			icon: () => h(Icon, { name: "tabler:trash" })
		}
	].filter(Boolean)

const handleDataAction = (image, key) => {
	if (key === "action-edit") {
		modalData.value = { ...image }
		showModal.value = true
	} else if (key === "action-delete") {
		const d = dialog.warning({
			title: "Konfirmasi Penghapusan Data",
			content: "Apakah anda yakin ingin menghapus gambar ini?",
			positiveText: "Ya",
			negativeText: "Tidak",
			positiveButtonProps: { loading: false },
			onPositiveClick: () => {
				d.positiveButtonProps.loading = true
				return deleteData(image.id).catch(() => {
					d.positiveButtonProps.loading = false
					return false
				})
			}
		})
	}
}

const copyLink = async image => {
	const url = imageSrc(image.image_path)
	try {
		await navigator.clipboard.writeText(url)
		message.success("Link berhasil disalin")
	} catch (err) {
		message.error("Gagal menyalin link")
	}
}

const deleteData = async id => {
	try {
		const { data } = await axios.delete(`images/${id}`)
		message.success(data.message)
		fetchData()
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
}

const handleCloseModal = (refresh = false) => {
	showModal.value = false
	modalData.value = {}
	if (refresh) fetchData()
}

watch(
	searchQuery,
	debounce(() => fetchData(), 500)
)

onBeforeMount(() => fetchData())
</script>

<style scoped>
.image-card__meta {
	margin-top: 8px;
}
.image-card__title {
	font-weight: 600;
	font-size: 0.875rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.image-card__desc {
	font-size: 0.75rem;
	opacity: 0.8;
	margin-top: 4px;
}
.image-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px solid var(--divider-005-color);
}
</style>
