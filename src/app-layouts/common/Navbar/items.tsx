import { type MenuMixedOption } from "naive-ui/es/menu/src/interface"

import { useAuthStore } from "@/stores/auth"
import navItems from "./navItems"

type MenuMixedOptionWithPermission = MenuMixedOption & { permission: string | string[] }

const filterItem = (items: MenuMixedOptionWithPermission[], permission: string[]) => {
	const filtered = items.filter(item => {
		if (!item.permission) return true

		const itemPermission = Array.isArray(item.permission) ? item.permission : [item.permission]

		return itemPermission.every(p => permission.includes(p))
	})

	return filtered
		.map(item => {
			if (item.children) {
				item.children = filterItem(item.children as MenuMixedOptionWithPermission[], permission)

				if ((item.children as MenuMixedOptionWithPermission[]).length === 0) return null
			}

			return item
		})
		.filter(Boolean) as MenuMixedOptionWithPermission[]
}

export default function getItems(mode: "vertical" | "horizontal", collapsed: boolean): MenuMixedOption[] {
	const items = navItems as unknown as MenuMixedOptionWithPermission[]

	const auth = useAuthStore()

	if (!auth.user) return items

	if (auth.role === "admin") return items

	const permission = auth.user.access_permissions

	const filtered = filterItem(
		items,
		permission.map(p => p.name)
	)

	return filtered
}
