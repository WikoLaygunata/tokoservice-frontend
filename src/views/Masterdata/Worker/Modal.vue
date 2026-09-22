<template>
	<n-modal
		v-model:show="show"
		:mask-closable="false"
		preset="card"
		style="width: 500px; max-width: 95vw"
		:title="modalTitle"
		@after-leave="handleClose"
	>
		<n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
			<n-form-item label="Nama Teknisi" path="name">
				<n-input v-model:value="formData.name" placeholder="Masukkan nama lengkap teknisi" />
			</n-form-item>

			<n-form-item label="Nomor WhatsApp / HP" path="phone">
				<n-input v-model:value="formData.phone" placeholder="Contoh: 081234567890 (opsional)" />
			</n-form-item>

			<n-form-item label="Status Aktif" path="is_active">
				<n-switch v-model:value="formData.is_active">
					<template #checked>Aktif Menerima Servis</template>
					<template #unchecked>Nonaktif</template>
				</n-switch>
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
import { NButton, NForm, NFormItem, NInput, NModal, NSpace, NSwitch, useMessage, type FormInst, type FormRules } from "naive-ui"

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
const modalTitle = computed(() => (isEdit.value ? "Edit Data Teknisi" : "Tambah Teknisi Baru"))

const formData = ref({
	id: null as number | null,
	name: "",
	phone: "",
	is_active: true
})

const rules: FormRules = {
	name: [
		{ required: true, message: "Nama teknisi wajib diisi", trigger: "blur" }
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
					is_active: props.data.is_active !== undefined ? Boolean(props.data.is_active) : true
				}
			} else {
				formData.value = {
					id: null,
					name: "",
					phone: "",
					is_active: true
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
				is_active: formData.value.is_active
			}

			if (isEdit.value) {
				const { data } = await axios.put(`workers/${formData.value.id}`, payload)
				message.success(data.message || "Teknisi berhasil diperbarui")
			} else {
				const { data } = await axios.post("workers", payload)
				message.success(data.message || "Teknisi berhasil ditambahkan")
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
