<template>
	<div class="space-y-6">
		<n-card
			class="themed-card rounded-xl border shadow-sm"
			:segmented="{ content: true }"
			title="Analytics Dashboard"
		>
			<template #header-extra>
				<n-button :loading="loading" quaternary size="small" @click="fetchAnalytics(true)">Refresh</n-button>
			</template>

			<n-alert
				v-if="errorMessage"
				class="mb-4"
				closable
				:show-icon="true"
				type="error"
				@close="errorMessage = ''"
			>
				{{ errorMessage }}
			</n-alert>

			<n-spin :show="loading">
				<div class="space-y-8">
					<section>
						<h3 class="themed-title mb-4 text-base font-bold">Summary Cards</h3>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<div
								v-for="card in cardItems"
								:key="card.key"
								class="themed-card rounded-xl border bg-gradient-to-br p-4 shadow-sm transition hover:shadow-md"
								:style="{
									backgroundImage: `linear-gradient(135deg, ${card.color}14 0%, var(--card-color) 60%)`
								}"
							>
								<div class="flex items-start justify-between gap-2">
									<div class="themed-muted text-xs font-semibold uppercase tracking-wide">
										{{ card.label }}
									</div>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-lg"
										:style="{ backgroundColor: `${card.color}22` }"
									>
										<Icon :color="card.color" :name="card.icon" :size="16" />
									</div>
								</div>
								<div class="themed-title mt-2 text-3xl font-black">{{ card.value }}</div>
							</div>
						</div>
					</section>

					<section>
						<h3 class="themed-title mb-4 text-base font-bold">Growth Charts</h3>
						<div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
							<n-card
								v-for="chart in chartSections"
								:key="chart.key"
								class="themed-card rounded-xl border shadow-sm"
								size="small"
								:title="chart.title"
							>
								<div v-if="!chart.rows.length" class="themed-muted py-6 text-center text-sm">
									No data
								</div>
								<div v-else class="space-y-6">
									<div v-for="row in chart.rows" :key="`${chart.key}-${row.year}`" class="space-y-2">
										<div class="themed-muted text-xs font-semibold">Year {{ row.year }}</div>
										<div v-for="metric in chart.metrics" :key="metric.key" class="space-y-1">
											<div class="flex items-center justify-between text-xs">
												<span class="themed-soft font-medium">{{ metric.label }}</span>
												<span class="themed-title font-semibold">
													{{ row[metric.key] ?? 0 }}
												</span>
											</div>
											<div class="themed-track h-2 overflow-hidden rounded-full">
												<div
													class="h-full rounded-full transition-all duration-500"
													:style="{
														width: `${barWidth(row[metric.key] ?? 0, chart.maxValue)}%`,
														background: metric.color
													}"
												></div>
											</div>
										</div>
									</div>
								</div>
							</n-card>
						</div>
					</section>
				</div>
			</n-spin>
		</n-card>
	</div>
</template>

<script setup>
import Icon from "@/components/common/Icon.vue"
import { useAnalyticsStore } from "@/stores/analytics"
import { NAlert, NButton, NCard, NSpin, useMessage } from "naive-ui"
import { computed, onMounted, ref } from "vue"

const message = useMessage()
const analyticsStore = useAnalyticsStore()
const loading = ref(false)
const errorMessage = ref("")
const analytics = computed(() => analyticsStore.dashboard)

const cardMeta = [
	// Landing Page segment (blue shades)
	{ key: "user", label: "Users", color: "#2563eb", icon: "carbon:user-multiple" },
	{ key: "pengurus", label: "Pengurus", color: "#1d4ed8", icon: "carbon:user-admin" },
	{ key: "aktivis", label: "Aktivis", color: "#3b82f6", icon: "carbon:user-avatar" },
	{ key: "artikel", label: "Artikel", color: "#60a5fa", icon: "carbon:document" }
]

const cardItems = computed(() =>
	cardMeta.map(item => ({
		...item,
		value: analytics.value.cards[item.key] ?? 0
	}))
)

const chartSections = computed(() => {
	const sections = [
		{
			key: "landing",
			title: "Landing",
			rows: analytics.value.charts.landing || [],
			metrics: [
				{ key: "aktivis", label: "Aktivis", color: "#14b8a6" },
				{ key: "artikel", label: "Artikel", color: "#22c55e" }
			]
		}
	]

	return sections.map(section => {
		const maxValue =
			Math.max(1, ...section.rows.flatMap(row => section.metrics.map(metric => Number(row[metric.key] || 0)))) ||
			1

		return {
			...section,
			maxValue
		}
	})
})

const barWidth = (value, maxValue) => {
	if (!maxValue) return 0
	return Math.max(6, Math.round((Number(value || 0) / maxValue) * 100))
}

const fetchAnalytics = async (forceRefresh = false) => {
	loading.value = true
	errorMessage.value = ""
	try {
		await analyticsStore.ensureDashboard(forceRefresh)
	} catch (error) {
		errorMessage.value = error.response?.data?.message || error.message || "Gagal memuat analytics dashboard"
		message.error(errorMessage.value)
	}
	loading.value = false
}

onMounted(() => fetchAnalytics())
</script>

<style scoped>
.themed-card {
	border-color: var(--border-color);
}
.themed-subcard {
	border-color: var(--border-color);
	background: var(--hover-color);
}
.themed-title {
	color: var(--text-color-1);
}
.themed-soft {
	color: var(--text-color-2);
}
.themed-muted {
	color: var(--text-color-3);
}
.themed-track {
	background: var(--hover-color);
}
</style>
