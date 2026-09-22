<template>
	<n-modal
		v-model:show="show"
		:mask-closable="false"
		preset="card"
		style="width: 620px; max-width: 95vw"
		title="Kirim Pesan WhatsApp ke Pelanggan"
		@after-leave="handleClose"
	>
		<div class="space-y-4">
			<!-- Header Info Pelanggan & Tiket -->
			<div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800/60 p-3">
				<div>
					<div class="text-xs font-semibold text-slate-400">Penerima Pesan:</div>
					<div class="text-sm font-bold text-slate-100 flex items-center gap-1.5">
						<span>{{ ticket?.customer?.name || "Pelanggan" }}</span>
						<span class="font-mono text-xs text-emerald-400">({{ formattedPhone }})</span>
					</div>
				</div>
				<div class="text-right">
					<div class="text-xs font-semibold text-slate-400">Unit:</div>
					<div class="text-xs font-bold text-indigo-300">
						{{ ticket?.phoneBrand?.name || ticket?.phone_brand?.name }} {{ ticket?.model_name }}
					</div>
					<div class="font-mono text-[11px] text-slate-400">{{ ticket?.ticket_number }}</div>
				</div>
			</div>

			<!-- Template Selection -->
			<div>
				<label class="block mb-1 text-xs font-semibold text-slate-300">Pilih Template Pesan:</label>
				<n-select
					v-model:value="selectedTemplateId"
					:options="templateOptions"
					placeholder="Pilih template atau tulis pesan manual..."
					:loading="loadingTemplates"
					clearable
					@update:value="onSelectTemplate"
				/>
			</div>

			<!-- Editable Text Message -->
			<div>
				<label class="block mb-1 text-xs font-semibold text-slate-300">Teks Pesan (Dapat Diedit):</label>
				<n-input
					v-model:value="customMessage"
					type="textarea"
					:rows="6"
					placeholder="Tulis pesan untuk pelanggan..."
				/>
			</div>

			<!-- WhatsApp Bubble Preview -->
			<div class="rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-3.5">
				<div class="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400">
					<Icon name="tabler:brand-whatsapp" :size="18" />
					<span>Preview Tampilan di WhatsApp</span>
				</div>
				<div class="whitespace-pre-wrap rounded-lg bg-emerald-900/40 p-3 font-sans text-xs leading-relaxed text-emerald-100 border border-emerald-700/40 shadow-inner">
					{{ customMessage || "(Pesan masih kosong)" }}
				</div>
			</div>
		</div>

		<template #footer>
			<n-space justify="end">
				<n-button secondary @click="handleClose">Tutup</n-button>
				<n-button
					type="success"
					:disabled="!customMessage || !formattedPhone"
					@click="openWhatsApp"
				>
					<template #icon><Icon name="tabler:brand-whatsapp" :size="18" /></template>
					Buka WhatsApp Web / App
				</n-button>
			</n-space>
		</template>
	</n-modal>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import { generateWhatsAppUrl, parseWhatsAppTemplate, sanitizeWhatsAppNumber } from "@/utils/whatsapp"
import axios from "axios"
import { NButton, NInput, NModal, NSelect, NSpace, useMessage } from "naive-ui"
import { computed, ref, watch } from "vue"

const props = defineProps<{
	active: boolean
	ticket?: any
}>()

const emit = defineEmits<{
	(e: "closeModal"): void
}>()

const message = useMessage()
const show = ref(false)
const loadingTemplates = ref(false)
const templates = ref<any[]>([])
const selectedTemplateId = ref<number | null>(null)
const customMessage = ref("")

const formattedPhone = computed(() => {
	const rawPhone = props.ticket?.customer?.phone || ""
	return sanitizeWhatsAppNumber(rawPhone)
})

const templateOptions = computed(() => {
	return templates.value.map(t => ({
		value: t.id,
		label: t.title
	}))
})

const fetchTemplates = async () => {
	loadingTemplates.value = true
	try {
		const { data } = await axios.get("wa-templates", { params: { per_page: 100 } })
		templates.value = data.data || data || []

		// Auto pick first matching template if available
		if (templates.value.length > 0 && !selectedTemplateId.value) {
			const matching = templates.value.find(t =>
				t.title.toLowerCase().includes(props.ticket?.status?.toLowerCase() || "")
			) || templates.value[0]

			selectedTemplateId.value = matching.id
			onSelectTemplate(matching.id)
		}
	} catch (err: any) {
		message.error("Gagal memuat template WhatsApp: " + err.message)
	} finally {
		loadingTemplates.value = false
	}
}

const onSelectTemplate = (templateId: number | null) => {
	if (!templateId) {
		customMessage.value = ""
		return
	}
	const tpl = templates.value.find(t => t.id === templateId)
	if (tpl && props.ticket) {
		customMessage.value = parseWhatsAppTemplate(tpl.content, props.ticket)
	}
}

watch(
	() => props.active,
	async val => {
		show.value = val
		if (val) {
			selectedTemplateId.value = null
			customMessage.value = ""
			await fetchTemplates()
			if (templates.value.length === 0 && props.ticket) {
				customMessage.value = `Halo kak ${props.ticket.customer?.name || "Pelanggan"}, kami dari Toko Servis ingin menginformasikan mengenai unit ${props.ticket.model_name || ""} dengan No. Tiket ${props.ticket.ticket_number || ""}. Status terkini: *${props.ticket.status || ""}*. Terima kasih.`
			}
		}
	}
)

const handleClose = () => {
	show.value = false
	emit("closeModal")
}

const openWhatsApp = () => {
	if (!formattedPhone.value) {
		message.error("Nomor WhatsApp pelanggan tidak valid!")
		return
	}
	const url = generateWhatsAppUrl(formattedPhone.value, customMessage.value)
	window.open(url, "_blank")
	handleClose()
}
</script>
