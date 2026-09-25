<template>
	<n-modal
		v-model:show="show"
		:mask-closable="false"
		preset="card"
		:class="['service-ticket-customer-modal', { dark: themeStore.isThemeDark }]"
		style="width: 500px; max-width: 95vw; z-index: 2500"
		title="Tambah Pelanggan Baru Cepat"
		@after-leave="handleClose"
	>
		<n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
			<n-form-item label="Nama Pelanggan" path="name">
				<n-input v-model:value="formData.name" placeholder="Nama lengkap pelanggan" />
			</n-form-item>

			<n-form-item label="Nomor WhatsApp / HP" path="phone">
				<n-input v-model:value="formData.phone" placeholder="Contoh: 081234567890" />
			</n-form-item>

			<n-form-item label="Alamat (Opsional)" path="address">
				<n-input v-model:value="formData.address" placeholder="Alamat pelanggan" :rows="2" type="textarea" />
			</n-form-item>
		</n-form>

		<template #footer>
			<n-space justify="end">
				<n-button :disabled="loading" secondary @click="handleClose">Batal</n-button>
				<n-button :loading="loading" type="primary" @click="handleSubmit">Simpan & Pilih</n-button>
			</n-space>
		</template>
	</n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import axios from "axios"
import { useThemeStore } from "@/stores/theme"
import { NButton, NForm, NFormItem, NInput, NModal, NSpace, useMessage, type FormInst, type FormRules } from "naive-ui"

const props = defineProps<{
	active: boolean
}>()

const emit = defineEmits<{
	(e: "closeModal", newCustomer?: any): void
}>()

const message = useMessage()
const themeStore = useThemeStore()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const show = ref(false)

const formData = ref({
	name: "",
	phone: "",
	address: ""
})

const rules: FormRules = {
	name: [{ required: true, message: "Nama pelanggan wajib diisi", trigger: "blur" }],
	phone: [{ required: true, message: "Nomor WhatsApp wajib diisi", trigger: "blur" }]
}

watch(
	() => props.active,
	val => {
		show.value = val
		if (val) {
			formData.value = { name: "", phone: "", address: "" }
		}
	}
)

const handleClose = () => {
	show.value = false
	emit("closeModal")
}

const handleSubmit = (e: MouseEvent) => {
	e.preventDefault()
	formRef.value?.validate(async errors => {
		if (errors) return

		loading.value = true
		try {
			const { data } = await axios.post("customers", formData.value)
			const created = data.data || data
			message.success(data.message || "Pelanggan baru berhasil ditambahkan")
			show.value = false
			emit("closeModal", created)
		} catch (error: any) {
			message.error(error.response?.data?.message || error.message || "Gagal menyimpan pelanggan")
		} finally {
			loading.value = false
		}
	})
}
</script>

<style scoped>
:deep(.service-ticket-customer-modal) {
	background-color: var(--n-color) !important;
	color: var(--n-text-color) !important;
}

:deep(.service-ticket-customer-modal .n-card-header),
:deep(.service-ticket-customer-modal .n-card__content),
:deep(.service-ticket-customer-modal .n-card__footer) {
	background-color: var(--n-color) !important;
	color: var(--n-text-color) !important;
}
</style>
