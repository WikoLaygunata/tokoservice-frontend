<template>
	<div />
	<!-- <div class="sidebar-footer px-5 py-5">
		<small class="text-muted">Saldo Tersedia</small>

		<div class="mt-2 grid grid-cols-3 gap-2">
			<h4 class="col-span-2 mb-0">Rp {{ formatNumber(balanceStore.balance) }}</h4>
		</div>
	</div> -->
</template>

<script lang="ts" setup>
import { formatNumber } from "@/mixins"
import { NButton, useMessage } from "naive-ui"
import { onMounted } from "vue"

const message = useMessage()

defineOptions({
	name: "SidebarFooter"
})
</script>

<style lang="scss" scoped>
.sidebar-footer {
	margin: 8px;
	background-color: var(--bg-body);
	border-radius: var(--border-radius);
	transition: all 0.3s;
}
</style>
