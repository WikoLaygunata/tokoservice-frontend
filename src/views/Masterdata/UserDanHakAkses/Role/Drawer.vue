<template>
	<n-drawer :default-width="400" placement="right" :show="active">
		<n-drawer-content :native-scrollbar="false" :title="formLabels.formTitle">
			<n-form ref="formRef" :label-width="80" :model="formData" :rules="formRules">
				<n-form-item label="Nama Role / Jabatan" path="title">
					<n-input v-model:value="formData.title" type="text" />
				</n-form-item>
			</n-form>

			<n-divider />

			<n-checkbox-group v-model:value="formData.access_permissions">
				<n-collapse>
					<n-collapse-item
						v-for="permissionGroup in Object.entries(permissions)"
						:key="permissionGroup[0]"
						:title="permissionGroup[0]"
					>
						<n-space item-style="display: flex;">
							<n-checkbox
								v-for="permission in permissionGroup[1]"
								:key="permission.name"
								:value="permission.name"
							>
								{{ permission.title }}
							</n-checkbox>
						</n-space>
					</n-collapse-item>
				</n-collapse>
			</n-checkbox-group>

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
import {
	NButton,
	NCheckbox,
	NCheckboxGroup,
	NCollapse,
	NCollapseItem,
	NDivider,
	NDrawer,
	NDrawerContent,
	NForm,
	NFormItem,
	NInput,
	NSpace,
	useMessage
} from "naive-ui"
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
	formTitle: "Tambah Data Role",
	submitButton: "Simpan"
})

// Data
const permissions = ref([])

const formData = ref({
	title: "",
	access_permissions: {}
})

const formRules = {
	title: {
		required: true,
		message: "Nama Role wajib diisi",
		trigger: ["blur"]
	}
}

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
		const { data } = await axios.post(`roles`, formData.value)

		message.success(data.message)

		resetFormData()
		emit("closeDrawer", true)
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}

	loading.value = false
}

const updateData = async () => {
	loading.value = true

	try {
		const { data } = await axios.put(`roles/${formData.value.id}`, formData.value)

		message.success(data.message)

		resetFormData()
		emit("closeDrawer", true)
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}

	loading.value = false
}

const resetFormData = () => {
	formData.value = {
		title: "",
		access_permissions: {}
	}
}

const fetchPermissions = async () => {
	try {
		const { data } = await axios.get("roles/permissions")

		permissions.value = data
	} catch (error) {
		message.error(error.response?.data?.message || error.message)
	}
}

// Watchers
watch(active, async value => {
	if (value) {
		await fetchPermissions()

		// Get data from props and assign it to a new variable or make it non-reactive, so it won't affect the original data in datatable
		const data = Object.assign({}, props.data)

		if (data.access_permissions) {
			data.access_permissions = data.access_permissions.map(permission => permission.name)
		}

		formData.value = data

		if (formData.value.id) {
			formLabels.value.formTitle = "Edit Data Role"
			formLabels.value.submitButton = "Simpan Perubahan"
		} else {
			formLabels.value.formTitle = "Tambah Data Role"
			formLabels.value.submitButton = "Simpan"
		}
	} else {
		emit("closeDrawer")
	}
})
</script>
