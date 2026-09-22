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
			<n-form-item label="Nama Kategori / Jasa Servis / Sparepart" path="name">
				<n-input
					v-model:value="formData.name"
					placeholder="Contoh: Ganti LCD, Ganti Baterai, Service IC Power, Reball CPU"
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
const modalTitle = computed(() => (isEdit.value ? "Edit Kategori Servis" : "Tambah Kategori Servis Baru"))

const formData = ref({
	id: null as number | null,
	name: ""
})

const rules: FormRules = {
	name: [
		{ required: true, message: "Nama kategori/jasa servis wajib diisi", trigger: "blur" }
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
					name: props.data.name || ""
				}
			} else {
				formData.value = {
					id: null,
					name: ""
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
				name: formData.value.name
			}

			if (isEdit.value) {
				const { data } = await axios.put(`service-categories/${formData.value.id}`, payload)
				message.success(data.message || "Kategori servis berhasil diperbarui")
			} else {
				const { data } = await axios.post("service-categories", payload)
				message.success(data.message || "Kategori servis berhasil ditambahkan")
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
