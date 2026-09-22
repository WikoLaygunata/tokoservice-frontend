<template>
	<n-modal
		v-model:show="show"
		:mask-closable="false"
		preset="card"
		style="width: 550px; max-width: 95vw"
		:title="modalTitle"
		@after-leave="handleClose"
	>
		<n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
			<n-form-item label="Nama Pelanggan" path="name">
				<n-input v-model:value="formData.name" placeholder="Masukkan nama pelanggan" />
			</n-form-item>

			<n-form-item label="Nomor WhatsApp / HP" path="phone">
				<n-input v-model:value="formData.phone" placeholder="Contoh: 081234567890" />
			</n-form-item>

			<n-form-item label="Alamat" path="address">
				<n-input
					v-model:value="formData.address"
					placeholder="Masukkan alamat pelanggan (opsional)"
					:rows="3"
					type="textarea"
				/>
			</n-form-item>
		</n-form>

		<template #footer>
			<n-space justify="end">
				<n-button :disabled="loading" secondary @click="handleClose">Batal</n-button>
				<n-button :loading="loading" type="primary" @click="handleSubmit">Simpan</n-button>
			</n-space>
		</template>
	</n-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import axios from "axios"
import { NButton, NForm, NFormItem, NInput, NModal, NSpace, useMessage, type FormInst, type FormRules } from "naive-ui"

const props = defineProps<{
	active: boolean
	data?: any
}>()

const emit = defineEmits<{
	(e: "closeModal", refresh?: boolean): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const show = ref(false)

const isEdit = computed(() => !!props.data?.id)
const modalTitle = computed(() => (isEdit.value ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"))

const formData = ref({
	id: null as number | null,
	name: "",
	phone: "",
	address: ""
})

const rules: FormRules = {
	name: [
		{ required: true, message: "Nama pelanggan wajib diisi", trigger: "blur" }
	],
	phone: [
		{ required: true, message: "Nomor WhatsApp/HP wajib diisi", trigger: "blur" }
	]
}

watch(
	() => props.active,
	val => {
		show.value = val
		if (val) {
			if (props.data && props.data.id) {
				formData.value = {
					id: props.data.id,
					name: props.data.name || "",
					phone: props.data.phone || "",
					address: props.data.address || ""
				}
			} else {
				formData.value = {
					id: null,
					name: "",
					phone: "",
					address: ""
				}
			}
		}
	}
)

const handleClose = () => {
	show.value = false
	emit("closeModal", false)
}

const handleSubmit = (e: MouseEvent) => {
	e.preventDefault()
	formRef.value?.validate(async errors => {
		if (errors) return

		loading.value = true
		try {
			const payload = {
				name: formData.value.name,
				phone: formData.value.phone,
				address: formData.value.address
			}

			if (isEdit.value) {
				const { data } = await axios.put(`customers/${formData.value.id}`, payload)
				message.success(data.message || "Pelanggan berhasil diperbarui")
			} else {
				const { data } = await axios.post("customers", payload)
				message.success(data.message || "Pelanggan berhasil ditambahkan")
			}

			emit("closeModal", true)
		} catch (error: any) {
			message.error(error.response?.data?.message || error.message || "Terjadi kesalahan")
		} finally {
			loading.value = false
		}
	})
}
</script>
