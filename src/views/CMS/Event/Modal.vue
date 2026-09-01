<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Title" path="title">
				<n-input v-model:value="formData.title" placeholder="Masukkan judul event" />
			</n-form-item>

			<n-form-item label="Deskripsi" path="description">
				<n-input
					v-model:value="formData.description"
					:autosize="{ minRows: 3, maxRows: 6 }"
					placeholder="Masukkan deskripsi (opsional)"
					type="textarea"
				/>
			</n-form-item>

			<n-form-item label="Tahun" path="year">
				<n-input-number
					v-model:value="formData.year"
					:max="2100"
					:min="1900"
					placeholder="Contoh: 2024 (opsional)"
					style="width: 100%"
				/>
			</n-form-item>

			<n-form-item label="Gambar" path="image_path">
				<div class="upload-section">
					<n-upload
						accept="image/*"
						:custom-request="handleFileSelect"
						:disabled="compressingImage"
						:max="1"
						:show-file-list="false"
					>
						<n-button :loading="compressingImage">
							<Icon class="mr-1" :name="UploadIcon" :size="18" />
							{{ imagePathLabel }}
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
						v-else-if="formData.image_path && typeof formData.image_path === 'string'"
						class="image-preview mt-2"
					>
						<n-image
							height="80"
							object-fit="cover"
							:src="imagePathUrl"
							style="border-radius: 4px"
							width="80"
						/>
					</div>
				</div>
			</n-form-item>

			<n-form-item label="Status Aktif" path="is_active">
				<n-select v-model:value="formData.is_active" :options="statusOptions" placeholder="Pilih Status" />
			</n-form-item>
		</n-form>

		<n-space justify="end">
			<n-button secondary @click="closeModal">Batal</n-button>
			<n-button :loading="loading || compressingImage" type="primary" @click="handleSubmit">Simpan</n-button>
		</n-space>
	</n-modal>
</template>

<script setup>
import Icon from "@/components/common/Icon.vue"
import { compressImageFile } from "@/utils/imageCompression"
import axios from "axios"
import {
	NButton,
	NDivider,
	NForm,
	NFormItem,
	NImage,
	NInput,
	NInputNumber,
	NModal,
	NSpace,
	NSelect,
	NUpload,
	useMessage
} from "naive-ui"
import { computed, ref, toRefs, watch } from "vue"

// Props
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
const formRef = ref(null)
const formLabels = ref({ formTitle: "Tambah Data Event", submitButton: "Simpan" })

const formData = ref({
	id: null,
	title: "",
	description: "",
	image_path: null,
	year: null,
	is_active: 1
})

const formRules = {
	title: { required: true, message: "Title wajib diisi", trigger: ["blur"] },
	is_active: { type: "number", required: true, message: "Status wajib dipilih", trigger: ["blur"] }
}

const statusOptions = [
	{ value: 1, label: "Aktif" },
	{ value: 0, label: "Tidak Aktif" }
]

const imagePreview = ref("")
const imagePathUrl = computed(() => {
	const path = formData.value.image_path
	if (!path || typeof path !== "string") return ""
	return path.startsWith("http")
		? path
		: (import.meta.env.VITE_IMAGE_BASE_URL || import.meta.env.VITE_API_BASE_URL) + path
})
const imagePathLabel = computed(() => {
	const p = formData.value.image_path
	if (p instanceof File) return p.name
	return "Pilih Gambar (max 4MB)"
})

const handleFileSelect = async ({ file, onFinish, onError }) => {
	if (!file?.file) return onFinish()
	compressingImage.value = true
	try {
		const compressedFile = await compressImageFile(file.file)
		formData.value.image_path = compressedFile
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

const buildFormData = () => {
	const fd = new FormData()
	fd.append("title", formData.value.title)
	fd.append("description", formData.value.description ?? "")
	fd.append("year", formData.value.year != null ? String(formData.value.year) : "")
	fd.append("is_active", String(formData.value.is_active))
	if (formData.value.image_path instanceof File) {
		fd.append("image_path", formData.value.image_path)
	}
	return fd
}

const buildJsonPayload = () => ({
	title: formData.value.title,
	description: formData.value.description ?? "",
	year: formData.value.year ?? null,
	is_active: formData.value.is_active
})

const saveData = async () => {
	loading.value = true
	try {
		const hasFile = formData.value.image_path instanceof File
		const { data } = hasFile
			? await axios.post("events", buildFormData(), { headers: { "Content-Type": "multipart/form-data" } })
			: await axios.post("events", buildJsonPayload())
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
		const hasFile = formData.value.image_path instanceof File
		const { data } = hasFile
			? await axios.put(`events/${formData.value.id}`, buildFormData(), {
					headers: { "Content-Type": "multipart/form-data" }
				})
			: await axios.put(`events/${formData.value.id}`, buildJsonPayload())
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
		description: "",
		image_path: null,
		year: null,
		is_active: 1
	}
	imagePreview.value = ""
}

watch(active, value => {
	if (value) {
		if (props.data?.id) {
			const isActive = props.data.is_active
			formData.value = {
				id: props.data.id,
				title: props.data.title ?? "",
				description: props.data.description ?? "",
				image_path: props.data.image_path ?? null,
				year: props.data.year ?? null,
				is_active: isActive === true || isActive === 1 ? 1 : 0
			}
			imagePreview.value = ""
			formLabels.value.formTitle = "Edit Data Event"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Data Event"
			formLabels.value.submitButton = "Simpan"
		}
	}
})
</script>

<style scoped>
.upload-section {
	width: 100%;
}
.image-preview {
	display: inline-block;
}
</style>
