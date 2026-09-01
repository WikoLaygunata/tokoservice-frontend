<template>
	<footer class="footer" :class="{ boxed }">
		<div class="wrap flex items-center justify-end gap-3">
			<div class="copy">© Copyright {{ year }} Wiko-BSLC</div>
		</div>
	</footer>
</template>

<script lang="ts" setup>
import { ref, toRefs } from "vue"

defineOptions({
	name: "FooterEL"
})

const props = defineProps<{
	boxed: boolean
}>()
const { boxed } = toRefs(props)

const year = ref(new Date().getFullYear())
</script>

<style lang="scss" scoped>
.footer {
	width: 100%;
	max-width: 100%;
	padding: var(--view-padding);
	padding-top: 0;
	overflow: hidden;
	font-size: 13px;

	.wrap {
		overflow: hidden;
		width: 100%;
		max-width: 100%;

		.copy {
			line-height: 1.6;

			a {
				font-weight: bold;
				text-decoration: none;
			}
			* {
				display: inline;
			}
			i {
				display: inline-block;
			}
		}
	}

	&.boxed {
		padding: 0;
		.wrap {
			padding: var(--view-padding);
			padding-top: 0;
			max-width: var(--boxed-width);
			margin: 0 auto;
		}
	}

	@media (max-width: 700px) {
		font-size: 10px;

		i.n-icon {
			font-size: 18px !important;
		}
	}
}
</style>
