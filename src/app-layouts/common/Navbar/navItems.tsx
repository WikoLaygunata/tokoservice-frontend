import { renderIcon } from "@/utils"
import { h } from "vue"
import { RouterLink } from "vue-router"

export default [
	{
		label: () => h(RouterLink, { to: { name: "Dashboard" } }, { default: () => "Dashboard" }),
		key: "Dashboard",
		icon: renderIcon("tabler:layout-dashboard")
	},
	{
		label: () => h(RouterLink, { to: { name: "ServiceTickets" } }, { default: () => "Meja Servis" }),
		key: "ServiceTickets",
		icon: renderIcon("tabler:tool"),
		permission: "read-service_ticket"
	},
	{
		label: "Master Data",
		key: "Masterdata",
		icon: renderIcon("tabler:database"),
		children: [
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-Customer" } }, { default: () => "Pelanggan" }),
				key: "Masterdata-Customer",
				permission: "read-customer"
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-Worker" } }, { default: () => "Teknisi" }),
				key: "Masterdata-Worker",
				permission: "read-worker"
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-PhoneBrand" } }, { default: () => "Merek HP" }),
				key: "Masterdata-PhoneBrand",
				permission: "read-phone_brand"
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-ServiceCategory" } }, { default: () => "Kategori Servis" }),
				key: "Masterdata-ServiceCategory",
				permission: "read-service_category"
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-WaTemplate" } }, { default: () => "Template WA" }),
				key: "Masterdata-WaTemplate",
				permission: "read-wa_template"
			},
			{
				label: "User & Akses",
				key: "Masterdata-UserDanHakAkses",
				children: [
					{
						label: () => h(RouterLink, { to: { name: "Masterdata-Role" } }, { default: () => "Role & Hak Akses" }),
						key: "Masterdata-Role",
						permission: "read-role"
					},
					{
						label: () => h(RouterLink, { to: { name: "Masterdata-User" } }, { default: () => "User Pengguna" }),
						key: "Masterdata-User",
						permission: "read-user"
					}
				]
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-Variable" } }, { default: () => "Pengaturan Toko" }),
				key: "Masterdata-Variable",
				permission: "read-variable"
			},
			{
				label: () => h(RouterLink, { to: { name: "Masterdata-Note" } }, { default: () => "Catatan SOP" }),
				key: "Masterdata-Note",
				permission: "read-note"
			}
		]
	},
	{
		label: "Laporan & Analitik",
		key: "Analytics",
		icon: renderIcon("tabler:chart-bar"),
		permission: "view-analytics",
		children: [
			{
				label: () => h(RouterLink, { to: { name: "Analytics-Spareparts" } }, { default: () => "Penggunaan Sparepart" }),
				key: "Analytics-Spareparts",
				permission: "view-analytics"
			},
			{
				label: () => h(RouterLink, { to: { name: "Analytics-Brands" } }, { default: () => "Distribusi Merek HP" }),
				key: "Analytics-Brands",
				permission: "view-analytics"
			},
			{
				label: () => h(RouterLink, { to: { name: "Analytics-Workers" } }, { default: () => "Performa Teknisi" }),
				key: "Analytics-Workers",
				permission: "view-analytics"
			},
			{
				label: () => h(RouterLink, { to: { name: "Analytics-Customers" } }, { default: () => "Histori Pelanggan" }),
				key: "Analytics-Customers",
				permission: "view-analytics"
			},
			{
				label: () => h(RouterLink, { to: { name: "Analytics-Logs" } }, { default: () => "Audit Trail" }),
				key: "Analytics-Logs",
				permission: "view-analytics"
			}
		]
	}
]
