import { Layout } from "@/types/theme.d"
import { authCheck } from "@/utils/auth"
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "Dashboard",
			component: () => import("@/views/Dashboard.vue"),
			meta: { title: "Dashboard Workshop", auth: true, roles: "all" }
		},
		{
			path: "/service-tickets",
			name: "ServiceTickets",
			component: () => import("@/views/ServiceTicket/Index.vue"),
			meta: { title: "Meja Servis & Transaksi", auth: true, roles: "all" }
		},
		{
			path: "/masterdata",
			meta: {
				auth: true,
				roles: "all"
			},
			children: [
				{
					path: "customer",
					name: "Masterdata-Customer",
					component: () => import("@/views/Masterdata/Customer/Index.vue"),
					meta: { title: "Pelanggan", auth: true, roles: "all" }
				},
				{
					path: "worker",
					name: "Masterdata-Worker",
					component: () => import("@/views/Masterdata/Worker/Index.vue"),
					meta: { title: "Teknisi", auth: true, roles: "all" }
				},
				{
					path: "phone-brand",
					name: "Masterdata-PhoneBrand",
					component: () => import("@/views/Masterdata/PhoneBrand/Index.vue"),
					meta: { title: "Merek HP", auth: true, roles: "all" }
				},
				{
					path: "service-category",
					name: "Masterdata-ServiceCategory",
					component: () => import("@/views/Masterdata/ServiceCategory/Index.vue"),
					meta: { title: "Kategori Servis", auth: true, roles: "all" }
				},
				{
					path: "wa-template",
					name: "Masterdata-WaTemplate",
					component: () => import("@/views/Masterdata/WaTemplate/Index.vue"),
					meta: { title: "Template WhatsApp", auth: true, roles: "all" }
				},
				{
					path: "role",
					name: "Masterdata-Role",
					component: () => import("@/views/Masterdata/UserDanHakAkses/Role/Index.vue"),
					meta: { title: "Role & Hak Akses", auth: true, roles: "all" }
				},
				{
					path: "user",
					name: "Masterdata-User",
					component: () => import("@/views/Masterdata/UserDanHakAkses/User/Index.vue"),
					meta: { title: "User Pengguna", auth: true, roles: "all" }
				},
				{
					path: "variable",
					name: "Masterdata-Variable",
					component: () => import("@/views/Masterdata/Variable/Index.vue"),
					meta: { title: "Pengaturan Toko", auth: true, roles: "all" }
				},
				{
					path: "note",
					name: "Masterdata-Note",
					component: () => import("@/views/Masterdata/Note/Index.vue"),
					meta: { title: "Catatan SOP", auth: true, roles: "all" }
				}
			]
		},
		{
			path: "/analytics",
			name: "Analytics",
			redirect: { name: "Analytics-Spareparts" },
			meta: { title: "Laporan & Analitik", auth: true, roles: "all" },
			children: [
				{
					path: "spareparts",
					name: "Analytics-Spareparts",
					component: () => import("@/views/Analytics/Spareparts.vue"),
					meta: { title: "Penggunaan Sparepart", auth: true, roles: "all" }
				},
				{
					path: "brands",
					name: "Analytics-Brands",
					component: () => import("@/views/Analytics/Brands.vue"),
					meta: { title: "Distribusi Merek HP", auth: true, roles: "all" }
				},
				{
					path: "workers",
					name: "Analytics-Workers",
					component: () => import("@/views/Analytics/Workers.vue"),
					meta: { title: "Performa Teknisi", auth: true, roles: "all" }
				},
				{
					path: "customers",
					name: "Analytics-Customers",
					component: () => import("@/views/Analytics/Customers.vue"),
					meta: { title: "Histori Pelanggan", auth: true, roles: "all" }
				},
				{
					path: "logs",
					name: "Analytics-Logs",
					component: () => import("@/views/Analytics/Logs.vue"),
					meta: { title: "Audit Trail", auth: true, roles: "all" }
				}
			]
		},
		{
			path: "/login",
			name: "Login",
			component: () => import("@/views/Auth/Login.vue"),
			meta: { title: "Login", forceLayout: Layout.Blank, checkAuth: true }
		},
		{
			path: "/logout",
			name: "Logout",
			redirect: "/login"
		},
		{
			path: "/:pathMatch(.*)*",
			name: "NotFound",
			component: () => import("@/views/NotFound.vue"),
			meta: { forceLayout: Layout.Blank }
		}
	]
})

router.beforeEach(route => {
	return authCheck(route)
})

export default router
