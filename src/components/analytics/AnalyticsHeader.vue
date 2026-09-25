<template>
	<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
					<Icon name="tabler:chart-bar" :size="24" />
				</div>
				<div>
					<h1 class="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Laporan & Analitik Workshop Servis</h1>
					<p class="text-xs text-slate-500 dark:text-slate-400">Evaluasi operasional workshop servis secara berkala.</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Periode:</span>
				<n-radio-group :value="datePreset" size="small" @update:value="$emit('update:datePreset', $event)">
					<n-radio-button value="this_month">Bulan Ini</n-radio-button>
					<n-radio-button value="last_month">Bulan Lalu</n-radio-button>
					<n-radio-button value="3_months">3 Bulan</n-radio-button>
					<n-radio-button value="6_months">6 Bulan</n-radio-button>
					<n-radio-button value="ytd">YTD</n-radio-button>
					<n-radio-button value="1_year">1 Tahun</n-radio-button>
					<n-radio-button value="">Semua</n-radio-button>
				</n-radio-group>
				<n-button secondary size="small" :loading="loading" @click="$emit('refresh')">
					<template #icon><Icon name="tabler:refresh" :size="16" /></template>
				</n-button>
			</div>
		</div>
	</n-card>
</template>

<script setup lang="ts">
import Icon from "@/components/common/Icon.vue"
import { NButton, NCard, NRadioButton, NRadioGroup } from "naive-ui"

defineProps<{
	datePreset: string
	loading: boolean
}>()

defineEmits<{
	(e: "update:datePreset", value: string): void
	(e: "refresh"): void
}>()
</script>
