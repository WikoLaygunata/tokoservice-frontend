<template>
	<n-modal
		preset="dialog"
		:show="active"
		style="width: 1000px; margin-top: 30px; margin-bottom: 30px"
		:title="formLabels.formTitle"
		@update:show="closeModal"
	>
		<n-divider class="divider" style="padding-top: 0" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Title" path="title">
				<n-input
					v-model:value="formData.title"
					maxlength="255"
					placeholder="Masukkan judul artikel"
					show-count
				/>
			</n-form-item>

			<div class="slug-thumbnail-grid">
				<div>
					<n-form-item label="Slug" path="slug">
						<n-space align="center" :size="8">
							<n-input
								v-model:value="formData.slug"
								maxlength="255"
								placeholder="url-friendly-slug"
								show-count
								style="flex: 1"
							/>
							<n-button secondary size="small" @click="generateSlug">Generate dari judul</n-button>
						</n-space>
					</n-form-item>
				</div>

				<div>
					<n-form-item label="Thumbnail" path="thumbnail">
						<div class="upload-section">
							<n-upload
								accept="image/*"
								:custom-request="handleFileSelect"
								:disabled="compressingImage"
								:max="1"
								:show-file-list="false"
							>
								<n-button class="thumbnail-button" :loading="compressingImage">
									<Icon class="mr-1" :name="UploadIcon" :size="18" />
									{{ thumbnailLabel }}
								</n-button>
							</n-upload>
							<div v-if="imagePreview" class="image-preview mt-2">
								<n-image
									height="80"
									object-fit="cover"
									:src="imagePreview"
									style="border-radius: 4px"
									width="80"
								/>
							</div>
							<div
								v-else-if="formData.thumbnail && typeof formData.thumbnail === 'string'"
								class="image-preview mt-2"
							>
								<n-image
									height="80"
									object-fit="cover"
									:src="thumbnailUrl"
									style="border-radius: 4px"
									width="80"
								/>
							</div>
						</div>
					</n-form-item>
				</div>
			</div>

			<n-form-item label="Content" path="content">
				<div class="tiptap-wrapper">
					<Tiptap v-if="active" :key="tiptapKey" v-model="formData.content" />
				</div>
			</n-form-item>

			<div class="status-type-grid">
				<n-form-item label="Status" path="status">
					<n-select v-model:value="formData.status" :options="statusOptions" placeholder="Pilih Status" />
				</n-form-item>
				<n-form-item label="Type" path="type">
					<n-select v-model:value="formData.type" :options="typeOptions" placeholder="Pilih Type" />
				</n-form-item>
			</div>
		</n-form>

		<n-space class="mt-4" justify="end">
			<n-button secondary @click="closeModal">Batal</n-button>
			<n-button :loading="loading || compressingImage" type="primary" @click="handleSubmit">Simpan</n-button>
		</n-space>
	</n-modal>
</template>

<script setup>
import Icon from "@/components/common/Icon.vue"
import Tiptap from "@/components/editors/Tiptap/index.vue"
import { compressImageFile } from "@/utils/imageCompression"
import axios from "axios"
import {
	NButton,
	NDivider,
	NForm,
	NFormItem,
	NImage,
	NInput,
	NModal,
	NSpace,
	NSelect,
	NUpload,
	useMessage
} from "naive-ui"
import { computed, ref, toRefs, watch } from "vue"

const props = defineProps({
	active: { type: Boolean, default: false },
	data: { type: Object, default: () => ({}) }
})

const emit = defineEmits(["closeModal"])
const message = useMessage()
const UploadIcon = "tabler:upload"
const loading = ref(false)
const compressingImage = ref(false)
const active = toRefs(props).active
const tiptapKey = ref(0)
const formRef = ref(null)
const formLabels = ref({ formTitle: "Tambah Artikel", submitButton: "Simpan" })

const formData = ref({
	id: null,
	title: "",
	slug: "",
	content: "",
	thumbnail: null,
	status: "draft",
	type: "Info"
})

const formRules = {
	title: { required: true, message: "Title wajib diisi", trigger: ["blur"] },
	slug: { required: true, message: "Slug wajib diisi", trigger: ["blur"] },
	content: { required: true, message: "Content wajib diisi", trigger: ["blur"] },
	status: { required: true, message: "Status wajib dipilih", trigger: ["blur"] },
	type: { required: true, message: "Type wajib dipilih", trigger: ["blur"] }
}

const statusOptions = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived" }
]
const typeOptions = [
	{ value: "Event", label: "Event" },
	{ value: "Info", label: "Info" }
]

const imagePreview = ref("")
const thumbnailUrl = computed(() => {
	const path = formData.value.thumbnail
	if (!path || typeof path !== "string") return ""
	return path.startsWith("http")
		? path
		: (import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL) + path
})
const thumbnailLabel = computed(() => {
	const p = formData.value.thumbnail
	if (p instanceof File) return p.name
	return "Pilih Thumbnail (max 4MB)"
})

const slugify = str => {
	if (!str) return ""
	return str
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "")
}

const generateSlug = () => {
	formData.value.slug = slugify(formData.value.title)
}

const handleFileSelect = async ({ file, onFinish, onError }) => {
	if (!file?.file) return onFinish()
	compressingImage.value = true
	try {
		const compressedFile = await compressImageFile(file.file)
		formData.value.thumbnail = compressedFile
		imagePreview.value = ""
		const reader = new FileReader()
		reader.onload = e => (imagePreview.value = e.target?.result || "")
		reader.readAsDataURL(compressedFile)
		onFinish()
	} catch (_error) {
		message.error("Gagal kompres gambar")
		onError?.()
	} finally {
		compressingImage.value = false
	}
}

const closeModal = () => {
	emit("closeModal")
	resetFormData()
}

const handleSubmit = () => {
	if (compressingImage.value) {
		message.warning("Tunggu proses kompres gambar selesai")
		return
	}
	formRef.value?.validate(errors => {
		if (!errors?.length) {
			if (formData.value.id) updateData()
			else saveData()
		}
	})
}

const buildFormData = (isUpdate = false) => {
	const fd = new FormData()
	if (isUpdate) fd.append("_method", "PUT")
	fd.append("title", formData.value.title)
	fd.append("slug", formData.value.slug)
	fd.append("content", formData.value.content)
	fd.append("status", formData.value.status)
	fd.append("type", formData.value.type)
	if (formData.value.thumbnail instanceof File) {
		fd.append("thumbnail", formData.value.thumbnail)
	}
	return fd
}

const buildJsonPayload = () => ({
	title: formData.value.title,
	slug: formData.value.slug,
	content: formData.value.content,
	status: formData.value.status,
	type: formData.value.type
})

const saveData = async () => {
	loading.value = true
	try {
		const hasFile = formData.value.thumbnail instanceof File
		const { data } = hasFile
			? await axios.post("articles", buildFormData())
			: await axios.post("articles", buildJsonPayload())
		message.success(data.message)
		resetFormData()
		emit("closeModal", true)
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
	loading.value = false
}

const updateData = async () => {
	loading.value = true
	try {
		const hasFile = formData.value.thumbnail instanceof File
		const { data } = hasFile
			? await axios.post(`articles/${formData.value.id}`, buildFormData(true))
			: await axios.put(`articles/${formData.value.id}`, buildJsonPayload())
		message.success(data.message)
		resetFormData()
		emit("closeModal", true)
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
	loading.value = false
}

const resetFormData = () => {
	formData.value = {
		id: null,
		title: "",
		slug: "",
		content: "",
		thumbnail: null,
		status: "draft",
		type: "Info"
	}
	imagePreview.value = ""
}

watch(active, value => {
	if (value) {
		tiptapKey.value += 1
		if (props.data?.id) {
			formData.value = {
				id: props.data.id,
				title: props.data.title ?? "",
				slug: props.data.slug ?? "",
				content: props.data.content ?? "",
				thumbnail: props.data.thumbnail ?? null,
				status: props.data.status ?? "draft",
				type: props.data.type ?? "Info"
			}
			imagePreview.value = ""
			formLabels.value.formTitle = "Edit Artikel"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Artikel"
			formLabels.value.submitButton = "Simpan"
		}
	}
})
</script>

<style scoped>
.slug-thumbnail-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	column-gap: 16px;
}
.upload-section {
	width: 100%;
	min-width: 0;
}
.thumbnail-button {
	max-width: 100%;
	white-space: normal;
}
.image-preview {
	display: inline-block;
}
.tiptap-wrapper {
	width: 100%;
	min-width: 0;
	min-height: 300px;
}
.status-type-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	column-gap: 16px;
}
@media (max-width: 640px) {
	.slug-thumbnail-grid {
		grid-template-columns: 1fr;
	}
	.status-type-grid {
		grid-template-columns: 1fr;
	}

	.thumbnail-button {
		width: 100%;
	}
}
</style>
