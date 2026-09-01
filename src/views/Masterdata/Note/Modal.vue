<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Judul" path="title">
				<n-input v-model:value="formData.title" placeholder="Masukkan judul note" />
			</n-form-item>

			<n-form-item label="Deskripsi" path="description">
				<n-input
					v-model:value="formData.description"
					:autosize="{ minRows: 3, maxRows: 10 }"
					placeholder="Masukkan deskripsi (opsional)"
					type="textarea"
				/>
			</n-form-item>

			<n-form-item label="Pinned" path="is_pinned">
				<n-switch v-model:value="formData.is_pinned" size="small">
					<template #checked>Ya</template>
					<template #unchecked>Tidak</template>
				</n-switch>
			</n-form-item>
		</n-form>

		<n-space justify="space-between" style="width: 100%">
			<div>
				<n-button v-if="formData.id" ghost type="error" @click="handleDelete">Hapus</n-button>
			</div>
			<n-space justify="end">
				<n-button secondary @click="closeModal">Batal</n-button>
				<n-button :loading="loading" type="primary" @click="handleSubmit">Simpan</n-button>
			</n-space>
		</n-space>
	</n-modal>
</template>

<script setup>
import axios from "axios"
import { NButton, NDivider, NForm, NFormItem, NInput, NModal, NSpace, NSwitch, useDialog, useMessage } from "naive-ui"
import { ref, toRefs, watch } from "vue"

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
const dialog = useDialog()

// States
const loading = ref(false)
const active = toRefs(props).active

// Form properties
const formRef = ref(null)
const formLabels = ref({
	formTitle: "Tambah Note",
	submitButton: "Simpan"
})

// Form Data
const formData = ref({
	id: null,
	title: "",
	description: "",
	is_pinned: false
})

const formRules = {
	title: {
		required: true,
		message: "Judul wajib diisi",
		trigger: ["blur"]
	}
}

const closeModal = () => {
	emit("closeModal")
	resetFormData()
}

const handleSubmit = e => {
	e.preventDefault()

	formRef.value?.validate(errors => {
		if (!errors || errors.length === 0) {
			if (formData.value.id) {
				updateData()
			} else {
				saveData()
			}
		}
	})
}

const saveData = async () => {
	loading.value = true

	try {
		const payload = {
			title: formData.value.title,
			description: formData.value.description || "",
			is_pinned: formData.value.is_pinned
		}

		const { data } = await axios.post("notes", payload)

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
		const payload = {
			title: formData.value.title,
			description: formData.value.description || "",
			is_pinned: formData.value.is_pinned
		}

		const { data } = await axios.put(`notes/${formData.value.id}`, payload)

		message.success(data.message)
		resetFormData()
		emit("closeModal", true)
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}

	loading.value = false
}

const handleDelete = () => {
	if (!formData.value.id) return

	dialog.warning({
		title: "Konfirmasi Penghapusan Note",
		content: "Apakah anda yakin ingin menghapus note ini?",
		positiveText: "Ya",
		negativeText: "Tidak",
		onPositiveClick: async () => {
			try {
				const { data } = await axios.delete(`notes/${formData.value.id}`)
				message.success(data.message)
				resetFormData()
				emit("closeModal", true)
			} catch (error) {
				message.error(error.response?.data?.message || error.message)
			}
		}
	})
}

const resetFormData = () => {
	formData.value = {
		id: null,
		title: "",
		description: "",
		is_pinned: false
	}
}

watch(active, value => {
	if (value) {
		if (props.data?.id) {
			formData.value = {
				id: props.data.id,
				title: props.data.title ?? "",
				description: props.data.description ?? "",
				is_pinned: props.data.is_pinned ?? false
			}
			formLabels.value.formTitle = "Edit Note"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Note"
			formLabels.value.submitButton = "Simpan"
		}
	}
})
</script>
