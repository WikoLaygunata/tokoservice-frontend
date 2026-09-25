<template>
	<div class="space-y-4">
		<!-- Page Header & Main Action -->
		<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md">
						<Icon name="tabler:tool" :size="24" />
					</div>
					<div>
						<h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
							Meja Operasional Servis HP
						</h1>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							Manajemen antrean perbaikan unit, status pengerjaan teknisi, dan riwayat servis.
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<can permission="create-service_ticket">
						<n-button type="primary" size="medium" @click="openCreateTicket">
							<template #icon><Icon name="carbon:add" :size="20" /></template>
							Buat Tiket Servis Baru
						</n-button>
					</can>
				</div>
			</div>
		</n-card>

		<!-- Tabs View: Board vs Table -->
		<n-tabs v-model:value="currentTab" type="segment" animated>
			<n-tab-pane name="board" :tab="renderTab('tabler:layout-kanban', 'Board View (Kanban Aktif)')">
				<BoardView
					ref="boardViewRef"
					@edit-ticket="openEditTicket"
					@chat-wa="openWhatsAppModal"
					@print-jobsheet="openJobSheetModal"
					@refresh="handleRefreshAll"
				/>
			</n-tab-pane>

			<n-tab-pane name="table" :tab="renderTab('tabler:table', 'Table View (Semua Riwayat)')">
				<TableView
					ref="tableViewRef"
					@edit-ticket="openEditTicket"
					@chat-wa="openWhatsAppModal"
					@print-jobsheet="openJobSheetModal"
					@refresh="handleRefreshAll"
				/>
			</n-tab-pane>
		</n-tabs>

		<!-- Service Ticket Form Drawer (Create / Edit) -->
		<FormDrawer
			:active="showFormDrawer"
			:data="selectedTicket"
			@close-drawer="handleCloseDrawer"
		/>

		<!-- WhatsApp Direct Modal -->
		<WhatsAppModal
			:active="showWaModal"
			:ticket="selectedTicket"
			@close-modal="showWaModal = false"
		/>

		<!-- A5 Job Sheet Print Preview Modal -->
		<JobSheetModal
			:active="showJobSheetModal"
			:ticket="selectedTicket"
			@close-modal="showJobSheetModal = false"
		/>
	</div>
</template>

<script setup lang="ts">
import Can from "@/components/common/Can.vue"
import Icon from "@/components/common/Icon.vue"
import { NButton, NCard, NTabPane, NTabs } from "naive-ui"
import { h, ref } from "vue"
import BoardView from "./BoardView.vue"
import FormDrawer from "./FormDrawer.vue"
import JobSheetModal from "./JobSheetModal.vue"
import TableView from "./TableView.vue"
import WhatsAppModal from "./WhatsAppModal.vue"

const currentTab = ref<"board" | "table">("board")

const renderTab = (icon: string, label: string) => () =>
	h("div", { class: "flex items-center gap-2" }, [
		h(Icon, { name: icon, size: 16 }),
		h("span", label)
	])

const boardViewRef = ref<any>(null)
const tableViewRef = ref<any>(null)

const showFormDrawer = ref(false)
const showWaModal = ref(false)
const showJobSheetModal = ref(false)
const selectedTicket = ref<any>(null)

const openCreateTicket = () => {
	selectedTicket.value = null
	showFormDrawer.value = true
}

const openEditTicket = (ticket: any) => {
	selectedTicket.value = { ...ticket }
	showFormDrawer.value = true
}

const openWhatsAppModal = (ticket: any) => {
	selectedTicket.value = { ...ticket }
	showWaModal.value = true
}

const openJobSheetModal = (ticket: any) => {
	selectedTicket.value = { ...ticket }
	showJobSheetModal.value = true
}

const handleCloseDrawer = (refresh = false) => {
	showFormDrawer.value = false
	selectedTicket.value = null
	if (refresh) {
		handleRefreshAll()
	}
}

const handleRefreshAll = () => {
	boardViewRef.value?.fetchBoard()
	tableViewRef.value?.fetchData()
}
</script>
