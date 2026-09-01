<template>
  <template v-if="canDo">
    <slot />
  </template>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { can } from "@/utils/auth";
import { computed } from "vue"

const props = defineProps<{
	permission: string
}>()

const auth = useAuthStore()
const canDo = computed(() => !!auth.user && can(props.permission))
</script>
