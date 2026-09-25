<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Nama" path="name">
				<n-input v-model:value="formData.name" placeholder="Masukkan nama variable (unique)" />
			</n-form-item>

			<n-form-item label="Value" path="value">
				<n-input
					v-model:value="formData.value"
					:autosize="{ minRows: 2, maxRows: 5 }"
					placeholder="Masukkan value (opsional)"
					type="textarea"
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
import { resolveImageUrl } from "@/utils/imageUrl"
import axios from "axios"
import { NButton, NDivider, NForm, NFormItem, NImage, NInput, NModal, NSpace, NUpload, useMessage } from "naive-ui"
import { computed, ref, toRefs, watch } from "vue"

// Props
const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	data: {
		type: Object,
		default: () => ({})
	}
})

// Emits
const emit = defineEmits(["closeModal"])

// Utils
const message = useMessage()

// Icons
const UploadIcon = "tabler:upload"

// States
const loading = ref(false)
const compressingImage = ref(false)
const active = toRefs(props).active

// Form properties
const formRef = ref(null)
const formLabels = ref({
	formTitle: "Tambah Data Variable",
	submitButton: "Simpan"
})

// Form Data - image_path: string (URL dari API) atau File (gambar baru)
const formData = ref({
	id: null,
	name: "",
	value: "",
	image_path: null
})

const formRules = {
	name: {
		required: true,
		message: "Nama wajib diisi",
		trigger: ["blur"]
	}
}

const imagePreview = ref("")

const imagePathUrl = computed(() => {
	const path = formData.value.image_path
	if (!path || typeof path !== "string") return ""
	return resolveImageUrl(path)
})

const imagePathLabel = computed(() => {
	const p = formData.value.image_path
	if (p instanceof File) return p.name
	return "Pilih Gambar (max 4MB)"
})

// Methods
const handleFileSelect = async ({ file, onFinish, onError }) => {
	if (!file?.file) return onFinish()
	compressingImage.value = true
	try {
		const compressedFile = await compressImageFile(file.file)
		formData.value.image_path = compressedFile
		imagePreview.value = ""
		const reader = new FileReader()
		reader.onload = e => {
			imagePreview.value = e.target?.result || ""
		}
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

const handleSubmit = e => {
	e.preventDefault()
	if (compressingImage.value) {
		message.warning("Tunggu proses kompres gambar selesai")
		return
	}

	formRef.value.validate(error => {
		if (!error) {
			if (formData.value.id) {
				updateData()
			} else {
				saveData()
			}
		}
	})
}

const buildFormData = () => {
	const fd = new FormData()
	fd.append("name", formData.value.name)
	fd.append("value", formData.value.value ?? "")
	if (formData.value.image_path instanceof File) {
		fd.append("image_path", formData.value.image_path)
	}
	return fd
}

const buildJsonPayload = () => ({
	name: formData.value.name,
	value: formData.value.value ?? ""
})

const saveData = async () => {
	loading.value = true

	try {
		const hasFile = formData.value.image_path instanceof File

		const { data } = hasFile
			? await axios.post("variables", buildFormData(), {
					headers: { "Content-Type": "multipart/form-data" }
				})
			: await axios.post("variables", buildJsonPayload())

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
			? await axios.put(`variables/${formData.value.id}`, buildFormData(), {
					headers: { "Content-Type": "multipart/form-data" }
				})
			: await axios.put(`variables/${formData.value.id}`, buildJsonPayload())

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
		name: "",
		value: "",
		image_path: null
	}
	imagePreview.value = ""
}

// Watchers
watch(active, value => {
	if (value) {
		if (props.data?.id) {
			formData.value = {
				id: props.data.id,
				name: props.data.name ?? "",
				value: props.data.value ?? "",
				image_path: props.data.image_path ?? null
			}
			imagePreview.value = ""
			formLabels.value.formTitle = "Edit Data Variable"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Data Variable"
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
