<template>
	<div class="empty-layout">
		<slot></slot>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: "Empty"
})
</script>

<style scoped>
.empty-layout {
	background: white; /* Ensure white background */
	color: black; /* Reset text color */
	margin: 0;
	padding: 0;
	width: 100vw; /* Full viewport width */
	height: 100vh; /* Full viewport height */
	display: flex;
	align-items: center;
	box-sizing: border-box;
}

* {
	all: unset; /* Reset all styles for child components */
	box-sizing: border-box;
}

body {
	background: white; /* Ensure body background is white */
	margin: 0;
}
</style>
