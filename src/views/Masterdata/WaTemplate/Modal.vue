<template>
	<n-modal
		v-model:show="show"
		:mask-closable="false"
		preset="card"
		style="width: 650px; max-width: 95vw"
		:title="modalTitle"
		@after-leave="handleClose"
	>
		<n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
			<n-form-item label="Judul Template WhatsApp" path="title">
				<n-input
					v-model:value="formData.title"
					placeholder="Contoh: Notifikasi Tiket Diterima, Update Selesai Servis, Konfirmasi Biaya Part"
				/>
			</n-form-item>

			<div class="mb-3">
				<div class="text-xs font-semibold mb-1 text-slate-500">Klik chip untuk menyisipkan variabel:</div>
				<div class="flex flex-wrap gap-1.5">
					<n-tag
						v-for="token in placeholderTokens"
						:key="token.key"
						class="cursor-pointer transition hover:opacity-80"
						size="small"
						:type="token.type"
						@click="insertToken(token.key)"
					>
						+ {{ token.key }} <span class="opacity-70 text-[10px]">({{ token.desc }})</span>
					</n-tag>
				</div>
			</div>

			<n-form-item label="Isi Pesan Template" path="content">
				<n-input
					ref="contentInputRef"
					v-model:value="formData.content"
					placeholder="Tulis format pesan WhatsApp..."
					:rows="6"
					type="textarea"
				/>
			</n-form-item>

			<!-- Live Preview -->
			<div class="rounded-lg border border-slate-700 bg-slate-900/70 p-3 mt-1">
				<div class="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
					<Icon name="tabler:brand-whatsapp" :size="16" />
					<span>Live Preview Tampilan WhatsApp</span>
				</div>
				<div class="whitespace-pre-wrap rounded bg-emerald-950/40 p-3 text-xs leading-relaxed text-emerald-100 font-sans border border-emerald-800/40">
					{{ previewText || "(Pesan template masih kosong)" }}
				</div>
			</div>
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
import Icon from "@/components/common/Icon.vue"
import { parseWhatsAppTemplate } from "@/utils/whatsapp"
import axios from "axios"
import {
	NButton,
	NForm,
	NFormItem,
	NInput,
	NModal,
	NSpace,
	NTag,
	useMessage,
	type FormInst,
	type FormRules
} from "naive-ui"
import { computed, ref, watch } from "vue"

const props = defineProps<{
	active: boolean
	data?: any
}>()

const emit = defineEmits<{
	(e: "closeModal", refresh?: boolean): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const contentInputRef = ref<any>(null)
const loading = ref(false)
const show = ref(false)

const isEdit = computed(() => !!props.data?.id)
const modalTitle = computed(() => (isEdit.value ? "Edit Template Pesan WhatsApp" : "Tambah Template WhatsApp"))

const placeholderTokens = [
	{ key: "{nama_customer}", desc: "Nama Pelanggan", type: "info" as const },
	{ key: "{brand_hp}", desc: "Merek HP", type: "primary" as const },
	{ key: "{model_hp}", desc: "Model HP", type: "success" as const },
	{ key: "{id_ticket}", desc: "Nomor Tiket", type: "warning" as const },
	{ key: "{status}", desc: "Status Servis", type: "error" as const }
]

const formData = ref({
	id: null as number | null,
	title: "",
	content: ""
})

const rules: FormRules = {
	title: [
		{ required: true, message: "Judul template wajib diisi", trigger: "blur" }
	],
	content: [
		{ required: true, message: "Isi pesan template wajib diisi", trigger: "blur" }
	]
}

const sampleTicket = {
	id: 1,
	ticket_number: "TCK-20260902-0001",
	model_name: "iPhone 13 Pro",
	status: "Selesai",
	customer: { name: "Budi Santoso", phone: "081234567890" },
	phoneBrand: { name: "Apple" }
}

const previewText = computed(() => {
	if (!formData.value.content) return ""
	return parseWhatsAppTemplate(formData.value.content, sampleTicket)
})

const insertToken = (token: string) => {
	formData.value.content = (formData.value.content || "") + token
}

watch(
	() => props.active,
	val => {
		show.value = val
		if (val) {
			if (props.data && props.data.id) {
				formData.value = {
					id: props.data.id,
					title: props.data.title || "",
					content: props.data.content || ""
				}
			} else {
				formData.value = {
					id: null,
					title: "",
					content: ""
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
				title: formData.value.title,
				content: formData.value.content
			}

			if (isEdit.value) {
				const { data } = await axios.put(`wa-templates/${formData.value.id}`, payload)
				message.success(data.message || "Template WA berhasil diperbarui")
			} else {
				const { data } = await axios.post("wa-templates", payload)
				message.success(data.message || "Template WA berhasil ditambahkan")
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
