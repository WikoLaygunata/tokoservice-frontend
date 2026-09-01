import { renderIcon } from "@/utils"
import { h } from "vue"
import { RouterLink } from "vue-router"

export default [
	{
		label: () => h(RouterLink, { to: { name: "Dashboard" } }, { default: () => "Home" }),
		key: "Dashboard",
		icon: renderIcon("tabler:layout-dashboard")
	},
	{
		label: "CMS",
		key: "CMS",
		icon: renderIcon("tabler:file-text"),
		children: [
			{
				label: () => h(RouterLink, { to: { name: "CMS-Artikel" } }, { default: () => "Artikel" }),
				key: "CMS-Artikel",
				permission: "read-article"
			},
			{
				label: () => h(RouterLink, { to: { name: "CMS-Divisi" } }, { default: () => "Divisi" }),
				key: "CMS-Divisi",
				permission: "read-division"
			},
			{
				label: () => h(RouterLink, { to: { name: "CMS-Subdivisi" } }, { default: () => "Subdivisi" }),
				key: "CMS-Subdivisi",
				permission: "read-subdivision"
			},
			{
				label: () => h(RouterLink, { to: { name: "CMS-Aktivis" } }, { default: () => "Aktivis" }),
				key: "CMS-Aktivis",
				permission: "read-activist"
			},
			{
				label: () => h(RouterLink, { to: { name: "CMS-Pengurus" } }, { default: () => "Pengurus" }),
				key: "CMS-Pengurus",
				permission: "read-officer"
			},
			{
				label: () => h(RouterLink, { to: { name: "CMS-Event" } }, { default: () => "Event" }),
				key: "CMS-Event",
				permission: "read-event"
			},
			{
				label: () => h(RouterLink, { to: { name: "CMS-Image" } }, { default: () => "Image" }),
				key: "CMS-Image",
				permission: "read-image"
			}
		]
	},

	{
		label: "Masterdata",
		key: "Masterdata",
		icon: renderIcon("tabler:server-bolt"),
		children: [
			{
				label: "User & Hak Akses",
				key: "Masterdata-UserDanHakAkses",
				children: [
					{
						label: () => h(RouterLink, { to: { name: "Masterdata-Role" } }, { default: () => "Role" }),
						key: "Masterdata-Role",
						permission: "read-role"
					},
					{
						label: () => h(RouterLink, { to: { name: "Masterdata-User" } }, { default: () => "User" }),
						key: "Masterdata-User",
						permission: "read-user"
					}
				]
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-Variable" } }, { default: () => "Variable" }),
				key: "Masterdata-Variable",
				permission: "read-variable"
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-Note" } }, { default: () => "Note" }),
				key: "Masterdata-Note",
				permission: "read-note"
			}
		]
	},
	{
		label: () => h(RouterLink, { to: { name: "Analytics" } }, { default: () => "Analytics" }),
		key: "Analytics",
		icon: renderIcon("tabler:chart-bar"),
		permission: "view-analytics"
	},
]
