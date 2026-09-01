<template>
	<div>
		<n-card title="Data Note">
			<n-divider class="divider" />

			<n-space :size="12" vertical>
				<n-space align="center" justify="space-between">
					<can permission="create-note">
						<n-button type="primary" @click="handleCreate">
							<Icon :name="AddIcon" :size="20" />
							Tambah Note
						</n-button>
					</can>

					<n-input v-model:value="searchQuery" clearable placeholder="Cari Note">
						<template #prefix>
							<Icon :name="SearchIcon" />
						</template>
					</n-input>
				</n-space>

				<!-- Grid cards-->
				<n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="16" :y-gap="16">
					<n-grid-item v-for="note in notes" :key="note.id">
						<n-card class="note-card" hoverable @click="handleEdit(note)">
							<div class="note-card__content">
								<div class="note-card__header">
									<div class="note-card__title">
										<Icon v-if="note.is_pinned" class="note-card__pin" :name="PinIcon" :size="18" />
										<span>{{ note.title }}</span>
									</div>
								</div>
								<div class="note-card__body">
									<n-ellipsis :line-clamp="3" :tooltip="false">
										{{ note.description || "-" }}
									</n-ellipsis>
								</div>
								<div class="note-card__footer">
									<span class="note-card__date">
										{{ formatDate(note.updated_at || note.created_at) }}
									</span>
								</div>
							</div>
						</n-card>
					</n-grid-item>
				</n-grid>

				<n-empty v-if="!loading && notes.length === 0" description="Belum ada note" />

				<div v-if="paginationReactive.pageCount > 1" class="mt-2 flex justify-end">
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
import { formatDateID } from "@/mixins"
import { can as canDo } from "@/utils/auth"
import axios from "axios"
import { debounce } from "lodash"
import {
	NButton,
	NCard,
	NDivider,
	NEmpty,
	NGrid,
	NGridItem,
	NInput,
	NPagination,
	NEllipsis,
	NSpace,
	useMessage
} from "naive-ui"
import { onBeforeMount, reactive, ref, watch } from "vue"
import Modal from "./Modal.vue"

// Utils
const message = useMessage()

// Icons
const AddIcon = "carbon:add"
const SearchIcon = "carbon:search"
const PinIcon = "tabler:pin-filled"

// States
const showModal = ref(false)
const loading = ref(false)

// List data
const notes = ref([])

// Pagination
const paginationReactive = reactive({
	page: 1,
	pageCount: 1,
	pageSize: 8,
	pageSizes: [8, 16, 24, 32],
	dataCount: 0
})

const searchQuery = ref("")

// Modal data
const modalData = ref({})

function formatDate(date) {
	if (!date) return "-"
	return formatDateID(date)
}

const fetchData = async () => {
	loading.value = true

	try {
		const { data } = await axios.get("notes", {
			params: {
				page: paginationReactive.page,
				pageSize: paginationReactive.pageSize,
				search: searchQuery.value
			}
		})

		notes.value = data.data
		paginationReactive.dataCount = data.total
		paginationReactive.pageCount = data.last_page

		if (paginationReactive.page > paginationReactive.pageCount && paginationReactive.pageCount > 0) {
			paginationReactive.page = 1
			await fetchData()
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
	paginationReactive.page = 1
	fetchData()
}

const handleCreate = () => {
	modalData.value = {}
	showModal.value = true
}

const handleEdit = note => {
	if (!canDo("update-note")) return
	modalData.value = { ...note }
	showModal.value = true
}

const handleCloseModal = (refresh = false) => {
	showModal.value = false
	modalData.value = {}
	if (refresh) {
		fetchData()
	}
}

watch(
	searchQuery,
	debounce(() => {
		paginationReactive.page = 1
		fetchData()
	}, 500)
)

onBeforeMount(() => {
	fetchData()
})
</script>

<style scoped>
.note-card {
	cursor: pointer;
	height: 160px;
	display: flex;
}

.note-card__content {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.note-card__header {
	display: flex;
	align-items: center;
	margin-bottom: 4px;
}

.note-card__title {
	display: flex;
	align-items: center;
	font-weight: 600;
}

.note-card__pin {
	margin-right: 4px;
}

.note-card__body {
	flex: 1;
	font-size: 0.875rem;
	opacity: 0.8;
}

.note-card__footer {
	display: flex;
	justify-content: flex-end;
	font-size: 0.75rem;
	opacity: 0.6;
	margin-top: 4px;
}
</style>
