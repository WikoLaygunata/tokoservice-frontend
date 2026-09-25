<template>
	<n-card class="rounded-xl border border-slate-200 shadow-sm dark:border-slate-700/60">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div class="flex min-w-0 items-center gap-3">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
					<Icon name="tabler:chart-bar" :size="24" />
				</div>
				<div class="min-w-0">
					<h1 class="truncate text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">Laporan & Analitik Workshop Servis</h1>
					<p class="text-xs text-slate-500 dark:text-slate-400">Evaluasi operasional workshop servis secara berkala.</p>
				</div>
			</div>

			<div class="flex min-w-0 flex-col gap-2 lg:items-end">
				<span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter Periode:</span>
				<div class="flex w-full min-w-0 items-center gap-2">
					<div class="min-w-0 flex-1 overflow-x-auto pb-1">
						<n-radio-group
							class="min-w-max whitespace-nowrap"
							:value="datePreset"
							size="small"
							@update:value="$emit('update:datePreset', $event)"
						>
							<n-radio-button value="this_month">Bulan Ini</n-radio-button>
							<n-radio-button value="last_month">Bulan Lalu</n-radio-button>
							<n-radio-button value="3_months">3 Bulan</n-radio-button>
							<n-radio-button value="6_months">6 Bulan</n-radio-button>
							<n-radio-button value="ytd">YTD</n-radio-button>
							<n-radio-button value="1_year">1 Tahun</n-radio-button>
							<n-radio-button value="">Semua</n-radio-button>
						</n-radio-group>
					</div>
					<n-button class="shrink-0" secondary size="small" :loading="loading" @click="$emit('refresh')">
						<template #icon><Icon name="tabler:refresh" :size="16" /></template>
					</n-button>
				</div>
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
