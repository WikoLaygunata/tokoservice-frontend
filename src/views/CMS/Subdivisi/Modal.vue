<template>
	<n-modal preset="dialog" :show="active" :show-icon="false" :title="formLabels.formTitle" @update:show="closeModal">
		<n-divider class="divider" style="padding-top: 12px" />

		<n-form ref="formRef" :model="formData" :rules="formRules">
			<n-form-item label="Divisi" path="division_id">
				<n-select
					v-model:value="formData.division_id"
					filterable
					:loading="loadingDivisions"
					:options="divisionOptions"
					placeholder="Pilih divisi"
				/>
			</n-form-item>

			<n-form-item label="Nama" path="name">
				<n-input
					v-model:value="formData.name"
					maxlength="255"
					placeholder="Masukkan nama subdivisi"
					show-count
				/>
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
import { useSelectOptionsStore } from "@/stores/selectOptions"
import { NButton, NDivider, NForm, NFormItem, NInput, NModal, NSelect, NSpace, useMessage } from "naive-ui"
import { onBeforeMount, ref, toRefs, watch } from "vue"

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

const emit = defineEmits(["closeModal"])
const message = useMessage()
const selectOptionsStore = useSelectOptionsStore()

const loading = ref(false)
const loadingDivisions = ref(false)
const active = toRefs(props).active

const formRef = ref(null)
const formLabels = ref({
	formTitle: "Tambah Data Subdivisi",
	submitButton: "Simpan"
})

const formData = ref({
	id: null,
	division_id: null,
	name: "",
	description: ""
})

const formRules = {
	division_id: {
		type: "number",
		required: true,
		message: "Divisi wajib dipilih",
		trigger: ["blur"]
	},
	name: {
		required: true,
		message: "Nama wajib diisi",
		trigger: ["blur"]
	}
}

const divisionOptions = ref([])

const fetchDivisions = async () => {
	loadingDivisions.value = true
	try {
		await selectOptionsStore.ensureOptions("divisions")
		divisionOptions.value = selectOptionsStore.getOptions("divisions")
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
	loadingDivisions.value = false
}

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
		const payload = {
			division_id: formData.value.division_id,
			name: formData.value.name,
			description: formData.value.description || null
		}
		const { data } = await axios.post("subdivisions", payload)
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
			division_id: formData.value.division_id,
			name: formData.value.name,
			description: formData.value.description || null
		}
		const { data } = await axios.put(`subdivisions/${formData.value.id}`, payload)
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
		division_id: null,
		name: "",
		description: ""
	}
}

onBeforeMount(() => fetchDivisions())

watch(active, value => {
	if (value) {
		if (props.data?.id) {
			formData.value = {
				id: props.data.id,
				division_id: props.data.division_id ?? props.data.division?.id ?? null,
				name: props.data.name ?? "",
				description: props.data.description ?? ""
			}
			formLabels.value.formTitle = "Edit Data Subdivisi"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			resetFormData()
			formLabels.value.formTitle = "Tambah Data Subdivisi"
			formLabels.value.submitButton = "Simpan"
		}
	}
})
</script>
