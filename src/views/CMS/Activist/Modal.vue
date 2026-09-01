<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

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
						{{ imagePathLabel }}
					</n-button>
				</n-upload>
				<div v-if="imagePreview" class="image-preview mt-2">
					<n-image height="80" object-fit="cover" :src="imagePreview" style="border-radius: 4px" width="80" />
				</div>
				<div
					v-else-if="formData.image_path && typeof formData.image_path === 'string'"
					class="image-preview mt-2"
				>
					<n-image height="80" object-fit="cover" :src="imagePathUrl" style="border-radius: 4px" width="80" />
				</div>
			</div>
		</n-form-item>

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Subdivisi" path="subdivision_id">
				<n-select
					v-model:value="formData.subdivision_id"
					filterable
					:options="subdivisionOptions"
					placeholder="Pilih Subdivisi"
				/>
			</n-form-item>

			<n-form-item label="Nama" path="name">
				<n-input v-model:value="formData.name" maxlength="255" placeholder="Masukkan nama aktivis" show-count />
			</n-form-item>

			<n-form-item label="Tahun" path="year">
				<n-input-number v-model:value="formData.year" :max="2100" :min="1900" placeholder="Masukkan tahun" />
			</n-form-item>

			<n-form-item label="Status Aktif" path="is_active">
				<n-select v-model:value="formData.is_active" :options="statusOptions" placeholder="Pilih Status" />
			</n-form-item>
		</n-form>

		<n-space justify="end">
			<n-button secondary @click="closeModal">Batal</n-button>
			<n-button :loading="loading || compressingImage" type="primary" @click="handleSubmit">
				{{ formLabels.submitButton }}
			</n-button>
		</n-space>
	</n-modal>
</template>

<script setup>
import axios from "axios"
import { compressImageFile } from "@/utils/imageCompression"
import {
	NButton,
	NDivider,
	NForm,
	NFormItem,
	NImage,
	NInput,
	NInputNumber,
	NModal,
	NSelect,
	NSpace,
	NUpload,
	useMessage
} from "naive-ui"
import { computed, ref, toRefs, watch } from "vue"

const props = defineProps({
	active: { type: Boolean, default: false },
	data: { type: Object, default: () => ({}) },
	subdivisionOptions: { type: Array, default: () => [] }
})

const emit = defineEmits(["closeModal"])
const message = useMessage()

const loading = ref(false)
const compressingImage = ref(false)
const active = toRefs(props).active
const formRef = ref(null)
const formLabels = ref({
	formTitle: "Tambah Aktivis",
	submitButton: "Simpan"
})

const currentYear = new Date().getFullYear()

const formData = ref({
	id: null,
	subdivision_id: null,
	name: "",
	year: currentYear,
	image_path: null,
	is_active: 1
})

const formRules = {
	subdivision_id: {
		type: "number",
		required: true,
		message: "Subdivisi wajib dipilih",
		trigger: ["blur"]
	},
	name: { required: true, message: "Nama wajib diisi", trigger: ["blur"] },
	year: {
		type: "number",
		required: true,
		message: "Tahun wajib diisi",
		trigger: ["blur"]
	},
	is_active: {
		type: "number",
		required: true,
		message: "Status wajib dipilih",
		trigger: ["blur"]
	}
}

const statusOptions = [
	{ value: 1, label: "Aktif" },
	{ value: 0, label: "Tidak Aktif" }
]

const subdivisionOptions = toRefs(props).subdivisionOptions

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

const handleSubmit = e => {
	e.preventDefault()
	if (compressingImage.value) {
		message.warning("Tunggu proses kompres gambar selesai")
		return
	}
	formRef.value.validate(error => {
		if (!error) {
			if (formData.value.id) updateData()
			else saveData()
		}
	})
}

const saveData = async () => {
	loading.value = true
	try {
		const hasFile = formData.value.image_path instanceof File
		let payload = formData.value
		let config = {}

		if (hasFile) {
			const fd = new FormData()
			fd.append("subdivision_id", String(formData.value.subdivision_id ?? ""))
			fd.append("name", formData.value.name)
			fd.append("year", String(formData.value.year ?? ""))
			fd.append("is_active", String(formData.value.is_active))
			fd.append("image_path", formData.value.image_path)
			payload = fd
			config = { headers: { "Content-Type": "multipart/form-data" } }
		}

		const { data } = await axios.post("activists", payload, config)
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
		let payload = formData.value
		let config = {}

		if (hasFile) {
			const fd = new FormData()
			fd.append("subdivision_id", String(formData.value.subdivision_id ?? ""))
			fd.append("name", formData.value.name)
			fd.append("year", String(formData.value.year ?? ""))
			fd.append("is_active", String(formData.value.is_active))
			fd.append("image_path", formData.value.image_path)
			payload = fd
			config = { headers: { "Content-Type": "multipart/form-data" } }
		}

		const { data } = await axios.put(`activists/${formData.value.id}`, payload, config)
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
		subdivision_id: null,
		name: "",
		year: currentYear,
		image_path: null,
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
				subdivision_id: props.data.subdivision_id ?? props.data.subdivision?.id ?? null,
				name: props.data.name ?? "",
				year: props.data.year ?? currentYear,
				image_path: props.data.image_path ?? null,
				is_active: isActive === true || isActive === 1 ? 1 : 0
			}
			imagePreview.value = ""
			formLabels.value.formTitle = "Edit Aktivis"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Aktivis"
			formLabels.value.submitButton = "Simpan"
		}
	}
})
</script>
