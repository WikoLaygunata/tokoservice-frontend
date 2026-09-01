<template>
	<n-drawer :default-width="400" placement="right" :show="active">
		<n-drawer-content :native-scrollbar="false" :title="formLabels.formTitle">
			<n-form ref="formRef" :label-width="80" :model="formData" :rules="formRules">
				<n-form-item label="Nama" path="name">
					<n-input v-model:value="formData.name" type="text" />
				</n-form-item>

				<n-form-item label="Role" path="role">
					<n-select v-model:value="formData.role" filterable :options="roles" />
				</n-form-item>

				<n-form-item label="Username" path="username">
					<n-input v-model:value="formData.username" type="text" />
				</n-form-item>

				<n-form-item label="Password" path="password">
					<n-input
						v-model:value="formData.password"
						:placeholder="formData.id ? 'Kosongkan jika tidak ingin mengubah password' : ''"
						type="password"
					/>
				</n-form-item>

				<n-form-item label="Status Aktif" path="is_active">
					<n-select
						v-model:value="formData.is_active"
						:options="items.status_options"
						placeholder="Status"
					></n-select>
				</n-form-item>
			</n-form>

			<template #footer>
				<n-space>
					<n-button class="mr-2" secondary @click="closeDrawer">Batal</n-button>
					<n-button icon-placement="left" :loading="loading" type="primary" @click="handleSubmit">
						{{ formLabels.submitButton }}
					</n-button>
				</n-space>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<script setup>
import axios from "axios"
import { NButton, NDrawer, NDrawerContent, NForm, NFormItem, NInput, NSelect, NSpace, useMessage } from "naive-ui"
import { ref, toRefs, watch } from "vue"

// Props
const props = defineProps({
	active: {
		type: Boolean,
		default: false
	},
	data: {
		type: Object,
		default: {}
	}
})

// Utils
const message = useMessage()

// Emits
const emit = defineEmits(["closeDrawer"])

// States
const loading = ref(false)
const active = toRefs(props).active

// Form properties
const formRef = ref(null)
const formLabels = ref({
	formTitle: "Tambah Data User",
	submitButton: "Simpan"
})

// Data
const roles = ref([])

const formData = ref({
	name: "",
	role: null,
	username: "",
	password: null,
	is_active: 1
})

const formRules = {
	name: {
		required: true,
		message: "Nama wajib diisi",
		trigger: ["blur"]
	},
	role: {
		type: "string",
		required: true,
		message: "Role wajib dipilih",
		trigger: ["blur"]
	},
	username: {
		required: true,
		message: "Username wajib diisi",
		trigger: ["blur"]
	},
	is_active: {
		type: "number",
		required: true,
		message: "Status Aktif wajib dipilih",
		trigger: ["blur"]
	}
}

const items = ref({
	status_options: [
		{ value: 1, label: "Aktif" },
		{ value: 0, label: "Tidak Aktif" }
	]
})

// Methods
const closeDrawer = () => {
	emit("closeDrawer")
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
		const { data } = await axios.post(`users`, formData.value)

		message.success(data.message)
		emit("closeDrawer", true)
		resetFormData()
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}

	loading.value = false
}

const updateData = async () => {
	loading.value = true

	try {
		const { data } = await axios.put(`users/${formData.value.id}`, formData.value)

		message.success(data.message)
		emit("closeDrawer", true)
		resetFormData()
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}

	loading.value = false
}

const resetFormData = () => {
	formData.value = {
		name: "",
		role: null,
		username: "",
		password: null,
		is_active: 1
	}
}

const fetchRoles = async () => {
	try {
		const { data } = await axios.get("roles")

		roles.value = data.data.map(role => ({
			value: role.name,
			label: role.title
		}))
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
}

// Watchers
watch(active, async value => {
	if (value) {
		await fetchRoles()

		if (props.data.id) {
			formData.value = {
				...props.data
			}

			formLabels.value.formTitle = "Edit Data User"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			formLabels.value.formTitle = "Tambah Data User"
			formLabels.value.submitButton = "Simpan"
		}
	} else {
		emit("closeDrawer")
	}
})
</script>
