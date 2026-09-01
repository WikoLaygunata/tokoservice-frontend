<template>
	<n-dropdown :options="options" placement="bottom-end" @select="handleSelect">
		<n-avatar round :size="32">
			<h5>
				{{
					userData.user?.name
						?.trim() // Remove leading and trailing spaces
						.split(/\s+/)[0] // Take the first word only
						.slice(0, 2) // Get the first two letters
						.toUpperCase()
				}}
			</h5>
		</n-avatar>
	</n-dropdown>
</template>

<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth"
import { renderIcon } from "@/utils"
import { NAvatar, NDropdown } from "naive-ui"
import { ref } from "vue"
import { useRouter } from "vue-router"

// Auth
const userData = useAuthStore()

const UserIcon = "ion:person-outline"
const LogoutIcon = "ion:log-out-outline"

defineOptions({
	name: "Avatar"
})

const router = useRouter()

const options = ref([
	// {
	// 	label: "Profile",
	// 	key: "route-Profile",
	// 	icon: renderIcon(UserIcon)
	// },
	{
		label: "Logout",
		key: "route-Logout",
		icon: renderIcon(LogoutIcon)
	}
])

function handleSelect(key: string) {
	if (key.indexOf("route-") === 0) {
		const path = key.split("route-")[1]
		router.push({ name: path })
	}
}
</script>
