<template>
	<n-drawer
		:default-width="680"
		placement="right"
		:show="active"
		style="max-width: 100vw"
		:mask-closable="false"
		@after-leave="handleClose"
	>
		<n-drawer-content :native-scrollbar="false" :title="drawerTitle" closable @close="handleClose">
			<n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
				<!-- Section: Pelanggan -->
				<div class="mb-4 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center gap-2 font-bold text-slate-200">
							<Icon name="tabler:user" :size="18" color="#38bdf8" />
							<span>Informasi Pelanggan</span>
						</div>
						<n-button size="tiny" tertiary type="primary" @click="showQuickCustomerModal = true">
							<template #icon><Icon name="tabler:user-plus" :size="14" /></template>
							+ Pelanggan Baru
						</n-button>
					</div>

					<n-form-item label="Pilih Pelanggan" path="customer_id">
						<n-select
							v-model:value="formData.customer_id"
							filterable
							placeholder="Cari nama atau nomor HP pelanggan..."
							:options="customerOptions"
							:loading="loadingOptions"
						/>
					</n-form-item>
				</div>

				<!-- Section: Spesifikasi Unit HP -->
				<div class="mb-4 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
					<div class="mb-3 flex items-center gap-2 font-bold text-slate-200">
						<Icon name="tabler:device-mobile" :size="18" color="#818cf8" />
						<span>Informasi Unit Smartphone</span>
					</div>

					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<n-form-item label="Merek HP" path="phone_brand_id">
							<n-select
								v-model:value="formData.phone_brand_id"
								filterable
								placeholder="Pilih Merek HP"
								:options="brandOptions"
								:loading="loadingOptions"
							/>
						</n-form-item>

						<n-form-item label="Model / Tipe HP" path="model_name">
							<n-input v-model:value="formData.model_name" placeholder="Contoh: iPhone 13 Pro, Galaxy S23" />
						</n-form-item>
					</div>

					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<n-form-item label="Nomor IMEI / SN" path="imei">
							<n-input v-model:value="formData.imei" placeholder="15 Digit IMEI (opsional)" />
						</n-form-item>

						<n-form-item label="PIN / Passcode / Kunci Pola" path="passcode">
							<n-input
								v-model:value="formData.passcode"
								placeholder="Contoh: 123456 atau Pola 'L'"
							/>
						</n-form-item>
					</div>

					<n-form-item label="Kondisi Fisik Saat Diterima" path="device_condition">
						<n-input
							v-model:value="formData.device_condition"
							placeholder="Contoh: Layar retak rambut, casing lecet pemakaian, tombol volume keras..."
							:rows="2"
							type="textarea"
						/>
					</n-form-item>

					<n-form-item label="Keluhan Kerusakan / Masalah" path="fault_description">
						<n-input
							v-model:value="formData.fault_description"
							placeholder="Jelaskan kendala yang dialami perangkat secara detail..."
							:rows="3"
							type="textarea"
						/>
					</n-form-item>
				</div>

				<!-- Section: Jasa Servis & Sparepart -->
				<div class="mb-4 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center gap-2 font-bold text-slate-200">
							<Icon name="tabler:tool" :size="18" color="#f59e0b" />
							<span>Estimasi Jasa Servis & Sparepart</span>
						</div>
						<n-button size="tiny" tertiary type="warning" @click="addCategoryRow">
							<template #icon><Icon name="tabler:plus" :size="14" /></template>
							Tambah Item
						</n-button>
					</div>

					<div v-if="formData.service_categories.length === 0" class="py-3 text-center text-xs text-slate-400">
						Belum ada sparepart / jasa servis yang ditambahkan (opsional).
					</div>

					<div v-else class="space-y-2.5">
						<div
							v-for="(row, idx) in formData.service_categories"
							:key="idx"
							class="flex items-center gap-2 rounded-lg bg-slate-900/60 p-2 border border-slate-700/40"
						>
							<div class="flex-1">
								<n-select
									v-model:value="row.id"
									filterable
									size="small"
									placeholder="Pilih Jasa / Sparepart"
									:options="serviceCategoryOptions"
								/>
							</div>
							<div class="w-24">
								<n-input-number
									v-model:value="row.qty"
									:min="1"
									size="small"
									placeholder="Qty"
								/>
							</div>
							<n-button circle size="small" tertiary type="error" @click="removeCategoryRow(idx)">
								<template #icon><Icon name="tabler:trash" :size="14" /></template>
							</n-button>
						</div>
					</div>
				</div>

				<!-- Section: Penugasan & Status Meja Kerja -->
				<div class="mb-4 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
					<div class="mb-3 flex items-center gap-2 font-bold text-slate-200">
						<Icon name="tabler:user-check" :size="18" color="#34d399" />
						<span>Penugasan & Status Meja Kerja</span>
					</div>

					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<n-form-item label="Tugaskan Teknisi" path="worker_id">
							<n-select
								v-model:value="formData.worker_id"
								clearable
								filterable
								placeholder="Pilih Teknisi"
								:options="workerOptions"
								:loading="loadingOptions"
							/>
						</n-form-item>

						<n-form-item label="Status Tiket" path="status">
							<n-select v-model:value="formData.status" :options="statusOptions" />
						</n-form-item>

						<n-form-item label="Masa Garansi (Hari)" path="warranty_days">
							<n-input-number v-model:value="formData.warranty_days" :min="0" class="w-full" />
						</n-form-item>
					</div>

					<n-form-item label="Catatan Tambahan Workshop (Internal)" path="notes">
						<n-input
							v-model:value="formData.notes"
							placeholder="Catatan teknisi, riwayat cek tegangan, dsb..."
							:rows="2"
							type="textarea"
						/>
					</n-form-item>
				</div>

				<!-- Section: Dokumentasi Foto Unit (Otomatis Terkompresi WebP < 100KB) -->
				<div class="mb-4 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
					<div class="mb-2 flex items-center justify-between">
						<div class="flex items-center gap-2 font-bold text-slate-200">
							<Icon name="tabler:camera" :size="18" color="#ec4899" />
							<span>Foto Dokumentasi Unit</span>
						</div>
						<span class="rounded bg-pink-950/60 px-2 py-0.5 text-[11px] font-semibold text-pink-300 border border-pink-800/40">
							Auto Compress WebP &lt; 100KB
						</span>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<!-- Foto 1 -->
						<div class="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3 text-center">
							<div class="mb-2 text-xs font-semibold text-slate-300">Foto 1 (Tampak Depan / Kerusakan)</div>
							<div v-if="photo1Preview" class="relative group mb-2 overflow-hidden rounded-lg border border-slate-600 aspect-video flex items-center justify-center bg-black/40">
								<img :src="photo1Preview" alt="Foto 1" class="max-h-full max-w-full object-contain" />
								<div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
									<n-button circle size="tiny" type="error" @click="clearPhoto1">
										<template #icon><Icon name="tabler:trash" :size="14" /></template>
									</n-button>
								</div>
							</div>
							<div v-if="photo1Info" class="mb-2 text-[10px] text-emerald-400 font-mono">
								{{ photo1Info }}
							</div>
							<input
								ref="photo1Input"
								type="file"
								accept="image/*"
								class="hidden"
								@change="handlePhotoUpload($event, 1)"
							/>
							<n-button
								size="small"
								secondary
								:loading="photo1Compressing"
								@click="triggerPhotoInput(1)"
							>
								<template #icon><Icon name="tabler:upload" :size="14" /></template>
								{{ photo1Preview ? "Ganti Foto 1" : "Upload Foto 1" }}
							</n-button>
						</div>

						<!-- Foto 2 -->
						<div class="rounded-lg border border-slate-700/80 bg-slate-900/60 p-3 text-center">
							<div class="mb-2 text-xs font-semibold text-slate-300">Foto 2 (Tampak Belakang / Bagian Lain)</div>
							<div v-if="photo2Preview" class="relative group mb-2 overflow-hidden rounded-lg border border-slate-600 aspect-video flex items-center justify-center bg-black/40">
								<img :src="photo2Preview" alt="Foto 2" class="max-h-full max-w-full object-contain" />
								<div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
									<n-button circle size="tiny" type="error" @click="clearPhoto2">
										<template #icon><Icon name="tabler:trash" :size="14" /></template>
									</n-button>
								</div>
							</div>
							<div v-if="photo2Info" class="mb-2 text-[10px] text-emerald-400 font-mono">
								{{ photo2Info }}
							</div>
							<input
								ref="photo2Input"
								type="file"
								accept="image/*"
								class="hidden"
								@change="handlePhotoUpload($event, 2)"
							/>
							<n-button
								size="small"
								secondary
								:loading="photo2Compressing"
								@click="triggerPhotoInput(2)"
							>
								<template #icon><Icon name="tabler:upload" :size="14" /></template>
								{{ photo2Preview ? "Ganti Foto 2" : "Upload Foto 2" }}
							</n-button>
						</div>
					</div>
				</div>
			</n-form>

			<template #footer>
				<n-space justify="end">
					<n-button :disabled="loading" secondary @click="handleClose">Batal</n-button>
					<n-button :loading="loading" type="primary" @click="handleSubmit">
						{{ isEdit ? "Simpan Perubahan" : "Simpan Tiket Servis" }}
					</n-button>
				</n-space>
			</template>
		</n-drawer-content>

		<!-- Quick Customer Modal -->
		<QuickCustomerModal
			:active="showQuickCustomerModal"
			@close-modal="handleQuickCustomerCreated"
		/>
	</n-drawer>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import { useSelectOptionsStore } from "@/stores/selectOptions"
import { compressImageFile } from "@/utils/imageCompression"
import axios from "axios"
import {
	NButton,
	NDrawer,
	NDrawerContent,
	NForm,
	NFormItem,
	NInput,
	NInputNumber,
	NSelect,
	NSpace,
	useMessage,
	type FormInst,
	type FormRules
} from "naive-ui"
import { computed, ref, watch } from "vue"
import QuickCustomerModal from "./QuickCustomerModal.vue"

const props = defineProps<{
	active: boolean
	data?: any
}>()

const emit = defineEmits<{
	(e: "closeDrawer", refresh?: boolean): void
}>()

const message = useMessage()
const selectOptionsStore = useSelectOptionsStore()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const loadingOptions = ref(false)
const showQuickCustomerModal = ref(false)

const isEdit = computed(() => !!props.data?.id)
const drawerTitle = computed(() =>
	isEdit.value ? `Edit Tiket Servis #${props.data?.ticket_number || ""}` : "Buat Tiket Servis Baru"
)

// Photo inputs & states
const photo1Input = ref<HTMLInputElement | null>(null)
const photo2Input = ref<HTMLInputElement | null>(null)
const photo1File = ref<File | null>(null)
const photo2File = ref<File | null>(null)
const photo1Preview = ref<string | null>(null)
const photo2Preview = ref<string | null>(null)
const photo1Info = ref<string | null>(null)
const photo2Info = ref<string | null>(null)
const photo1Compressing = ref(false)
const photo2Compressing = ref(false)

const statusOptions = [
	{ value: "Diterima", label: "Diterima" },
	{ value: "Diagnosis", label: "Diagnosis" },
	{ value: "Menunggu Part", label: "Menunggu Part" },
	{ value: "Pengerjaan", label: "Pengerjaan" },
	{ value: "Menunggu Diterima", label: "Menunggu Diterima" },
	{ value: "Selesai", label: "Selesai" },
	{ value: "Batal", label: "Batal" }
]

const customerOptions = computed(() => selectOptionsStore.getOptions("customers"))
const brandOptions = computed(() => selectOptionsStore.getOptions("phoneBrands"))
const workerOptions = computed(() => selectOptionsStore.getOptions("workers"))
const serviceCategoryOptions = computed(() => selectOptionsStore.getOptions("serviceCategories"))

const formData = ref({
	id: null as number | null,
	customer_id: null as number | null,
	phone_brand_id: null as number | null,
	model_name: "",
	imei: "",
	passcode: "",
	device_condition: "",
	fault_description: "",
	worker_id: null as number | null,
	status: "Diterima",
	notes: "",
	warranty_days: 30,
	service_categories: [] as Array<{ id: number | null; qty: number }>
})

const rules: FormRules = {
	customer_id: [{ required: true, type: "number", message: "Pelanggan wajib dipilih", trigger: ["blur", "change"] }],
	phone_brand_id: [{ required: true, type: "number", message: "Merek HP wajib dipilih", trigger: ["blur", "change"] }],
	model_name: [{ required: true, message: "Model HP wajib diisi", trigger: "blur" }],
	fault_description: [{ required: true, message: "Keluhan kerusakan wajib diisi", trigger: "blur" }]
}

const loadDropdowns = async () => {
	loadingOptions.value = true
	try {
		await Promise.all([
			selectOptionsStore.ensureOptions("customers", true),
			selectOptionsStore.ensureOptions("phoneBrands", true),
			selectOptionsStore.ensureOptions("workers", true),
			selectOptionsStore.ensureOptions("serviceCategories", true)
		])
	} catch (err: any) {
		message.error("Gagal memuat daftar dropdown: " + (err.response?.data?.message || err.message))
	} finally {
		loadingOptions.value = false
	}
}

const addCategoryRow = () => {
	formData.value.service_categories.push({ id: null, qty: 1 })
}

const removeCategoryRow = (index: number) => {
	formData.value.service_categories.splice(index, 1)
}

const triggerPhotoInput = (slot: 1 | 2) => {
	if (slot === 1) photo1Input.value?.click()
	else photo2Input.value?.click()
}

const handlePhotoUpload = async (event: Event, slot: 1 | 2) => {
	const target = event.target as HTMLInputElement
	const file = target.files?.[0]
	if (!file) return

	const origSizeKb = (file.size / 1024).toFixed(1)

	if (slot === 1) {
		photo1Compressing.value = true
		try {
			const compressed = await compressImageFile(file)
			const compSizeKb = (compressed.size / 1024).toFixed(1)
			photo1File.value = compressed
			photo1Preview.value = URL.createObjectURL(compressed)
			photo1Info.value = `WebP terkompres: ${origSizeKb}KB → ${compSizeKb}KB`
			message.success(`Foto 1 berhasil dikompres ke WebP (${compSizeKb}KB)`)
		} catch (err: any) {
			message.error("Gagal mengompres Foto 1: " + err.message)
		} finally {
			photo1Compressing.value = false
		}
	} else {
		photo2Compressing.value = true
		try {
			const compressed = await compressImageFile(file)
			const compSizeKb = (compressed.size / 1024).toFixed(1)
			photo2File.value = compressed
			photo2Preview.value = URL.createObjectURL(compressed)
			photo2Info.value = `WebP terkompres: ${origSizeKb}KB → ${compSizeKb}KB`
			message.success(`Foto 2 berhasil dikompres ke WebP (${compSizeKb}KB)`)
		} catch (err: any) {
			message.error("Gagal mengompres Foto 2: " + err.message)
		} finally {
			photo2Compressing.value = false
		}
	}
}

const clearPhoto1 = () => {
	photo1File.value = null
	photo1Preview.value = null
	photo1Info.value = null
	if (photo1Input.value) photo1Input.value.value = ""
}

const clearPhoto2 = () => {
	photo2File.value = null
	photo2Preview.value = null
	photo2Info.value = null
	if (photo2Input.value) photo2Input.value.value = ""
}

const handleQuickCustomerCreated = async (newCustomer?: any) => {
	showQuickCustomerModal.value = false
	if (newCustomer && newCustomer.id) {
		await selectOptionsStore.ensureOptions("customers", true)
		formData.value.customer_id = newCustomer.id
	}
}

const resetForm = () => {
	formData.value = {
		id: null,
		customer_id: null,
		phone_brand_id: null,
		model_name: "",
		imei: "",
		passcode: "",
		device_condition: "",
		fault_description: "",
		worker_id: null,
		status: "Diterima",
		notes: "",
		warranty_days: 30,
		service_categories: []
	}
	clearPhoto1()
	clearPhoto2()
}

watch(
	() => props.active,
	async val => {
		if (val) {
			await loadDropdowns()
			if (props.data && props.data.id) {
				const d = props.data
				const cats = (d.service_categories || d.serviceCategories || []).map((c: any) => ({
					id: c.id,
					qty: c.pivot?.qty ?? c.qty ?? 1
				}))

				formData.value = {
					id: d.id,
					customer_id: d.customer_id ?? d.customer?.id ?? null,
					phone_brand_id: d.phone_brand_id ?? d.phoneBrand?.id ?? null,
					model_name: d.model_name || "",
					imei: d.imei || "",
					passcode: d.passcode || "",
					device_condition: d.device_condition || "",
					fault_description: d.fault_description || "",
					worker_id: d.worker_id ?? d.worker?.id ?? null,
					status: d.status || "Diterima",
					notes: d.notes || "",
					warranty_days: d.warranty_days != null ? d.warranty_days : 30,
					service_categories: cats
				}

				if (d.photo_1_url || d.photo_1) {
					photo1Preview.value = d.photo_1_url || (d.photo_1?.startsWith("http") ? d.photo_1 : import.meta.env.VITE_API_BASE_URL + "/storage/" + d.photo_1)
				}
				if (d.photo_2_url || d.photo_2) {
					photo2Preview.value = d.photo_2_url || (d.photo_2?.startsWith("http") ? d.photo_2 : import.meta.env.VITE_API_BASE_URL + "/storage/" + d.photo_2)
				}
			} else {
				resetForm()
			}
		}
	}
)

const handleClose = () => {
	resetForm()
	emit("closeDrawer", false)
}

const handleSubmit = (e: MouseEvent) => {
	e.preventDefault()
	formRef.value?.validate(async errors => {
		if (errors) return

		loading.value = true
		try {
			const formPayload = new FormData()
			if (formData.value.customer_id) formPayload.append("customer_id", String(formData.value.customer_id))
			if (formData.value.phone_brand_id) formPayload.append("phone_brand_id", String(formData.value.phone_brand_id))
			formPayload.append("model_name", formData.value.model_name)
			if (formData.value.imei) formPayload.append("imei", formData.value.imei)
			if (formData.value.passcode) formPayload.append("passcode", formData.value.passcode)
			if (formData.value.device_condition) formPayload.append("device_condition", formData.value.device_condition)
			formPayload.append("fault_description", formData.value.fault_description)
			if (formData.value.worker_id) formPayload.append("worker_id", String(formData.value.worker_id))
			if (formData.value.status) formPayload.append("status", formData.value.status)
			if (formData.value.notes) formPayload.append("notes", formData.value.notes)
			if (formData.value.warranty_days != null) formPayload.append("warranty_days", String(formData.value.warranty_days))

			// Append valid service categories
			const validCategories = formData.value.service_categories.filter(c => c.id != null)
			validCategories.forEach((cat, index) => {
				formPayload.append(`service_categories[${index}][id]`, String(cat.id))
				formPayload.append(`service_categories[${index}][qty]`, String(cat.qty || 1))
			})

			// Append compressed WebP photos if new file selected
			if (photo1File.value) {
				formPayload.append("photo_1", photo1File.value)
			}
			if (photo2File.value) {
				formPayload.append("photo_2", photo2File.value)
			}

			if (isEdit.value) {
				formPayload.append("_method", "PUT")
				const { data } = await axios.post(`service-tickets/${formData.value.id}`, formPayload, {
					headers: { "Content-Type": "multipart/form-data" }
				})
				message.success(data.message || "Tiket servis berhasil diperbarui")
			} else {
				const { data } = await axios.post("service-tickets", formPayload, {
					headers: { "Content-Type": "multipart/form-data" }
				})
				message.success(data.message || "Tiket servis berhasil dibuat")
			}

			resetForm()
			emit("closeDrawer", true)
		} catch (error: any) {
			message.error(error.response?.data?.message || error.message || "Gagal menyimpan tiket servis")
		} finally {
			loading.value = false
		}
	})
}
</script>
