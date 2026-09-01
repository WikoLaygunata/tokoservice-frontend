<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Nama" path="name">
				<n-input v-model:value="formData.name" placeholder="Masukkan nama divisi" />
			</n-form-item>

			<n-form-item label="Deskripsi" path="description">
				<n-input
					v-model:value="formData.description"
					:autosize="{ minRows: 3, maxRows: 6 }"
					placeholder="Masukkan deskripsi (opsional)"
					type="textarea"
				/>
			</n-form-item>
		</n-form>

		<n-space justify="end">
			<n-button secondary @click="closeModal">Batal</n-button>
			<n-button :loading="loading" type="primary" @click="handleSubmit">Simpan</n-button>
		</n-space>
	</n-modal>
</template>

<script setup>
import axios from "axios"
import { NButton, NDivider, NForm, NFormItem, NInput, NModal, NSpace, useMessage } from "naive-ui"
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

// States
const loading = ref(false)
const active = toRefs(props).active

// Form properties
const formRef = ref(null)
const formLabels = ref({
	formTitle: "Tambah Data Divisi",
	submitButton: "Simpan"
})

// Form Data
const formData = ref({
	id: null,
	name: "",
	description: ""
})

const formRules = {
	name: {
		required: true,
		message: "Nama wajib diisi",
		trigger: ["blur"]
	}
}

// Methods
const closeModal = () => {
	emit("closeModal")
	resetFormData()
}

const handleSubmit = e => {
	e.preventDefault()

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

const saveData = async () => {
	loading.value = true

	try {
		const { data } = await axios.post("divisions", formData.value)

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
		const { data } = await axios.put(`divisions/${formData.value.id}`, formData.value)

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
		description: "",
		is_active: 1
	}
}

// Watchers
watch(active, value => {
	if (value) {
		if (props.data?.id) {
			const isActive = props.data.is_active
			formData.value = {
				id: props.data.id,
				name: props.data.name ?? "",
				description: props.data.description ?? "",
				is_active: isActive === true || isActive === 1 ? 1 : 0
			}
			formLabels.value.formTitle = "Edit Data Divisi"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Data Divisi"
			formLabels.value.submitButton = "Simpan"
		}
	}
})
</script>
