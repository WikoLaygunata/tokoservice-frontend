<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Gambar" path="image_path" :required="!formData.id">
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
							height="120"
							object-fit="contain"
							:src="imagePreview"
							style="border-radius: 4px"
							width="120"
						/>
					</div>
					<div
						v-else-if="formData.image_path && typeof formData.image_path === 'string'"
						class="image-preview mt-2"
					>
						<n-image
							height="120"
							object-fit="contain"
							:src="imagePathUrl"
							style="border-radius: 4px"
							width="120"
						/>
					</div>
					<p v-if="formData.id" class="mt-1 text-xs opacity-70">
						Kosongkan jika tidak ingin mengganti gambar
					</p>
				</div>
			</n-form-item>

			<n-form-item label="Deskripsi" path="description">
				<n-input
					v-model:value="formData.description"
					:autosize="{ minRows: 2, maxRows: 3 }"
					maxlength="255"
					placeholder="Deskripsi (opsional, max 255 karakter)"
					show-count
					type="textarea"
				/>
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
import { NButton, NDivider, NForm, NFormItem, NImage, NInput, NModal, NSpace, NUpload, useMessage } from "naive-ui"
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
const formLabels = ref({ formTitle: "Tambah Gambar", submitButton: "Simpan" })

const formData = ref({
	id: null,
	image_path: null,
	description: ""
})

const formRules = {}

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
	const isCreate = !formData.value.id
	const hasFile = formData.value.image_path instanceof File
	const hasExistingPath = formData.value.image_path && typeof formData.value.image_path === "string"

	if (isCreate && !hasFile) {
		message.error("Gambar wajib dipilih")
		return
	}

	if (!hasFile && !hasExistingPath && isCreate) {
		message.error("Gambar wajib dipilih")
		return
	}

	if (formData.value.id) {
		updateData()
	} else {
		saveData()
	}
}

const buildFormData = () => {
	const fd = new FormData()
	fd.append("description", formData.value.description ?? "")
	if (formData.value.image_path instanceof File) {
		fd.append("image_path", formData.value.image_path)
	}
	return fd
}

const buildJsonPayload = () => ({
	description: formData.value.description ?? ""
})

const saveData = async () => {
	loading.value = true
	try {
		const hasFile = formData.value.image_path instanceof File
		if (!hasFile) {
			message.error("Gambar wajib dipilih")
			loading.value = false
			return
		}
		const { data } = await axios.post("images", buildFormData(), {
			headers: { "Content-Type": "multipart/form-data" }
		})
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
			? await axios.put(`images/${formData.value.id}`, buildFormData(), {
					headers: { "Content-Type": "multipart/form-data" }
				})
			: await axios.put(`images/${formData.value.id}`, buildJsonPayload())
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
		image_path: null,
		description: ""
	}
	imagePreview.value = ""
}

watch(active, value => {
	if (value) {
		if (props.data?.id) {
			formData.value = {
				id: props.data.id,
				image_path: props.data.image_path ?? null,
				description: props.data.description ?? ""
			}
			imagePreview.value = ""
			formLabels.value.formTitle = "Edit Gambar"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Gambar"
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
