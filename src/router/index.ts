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
			meta: { title: "Dashboard", auth: true, roles: "all" }
		},
		{
			path: "/analytics",
			name: "Analytics",
			component: () => import("@/views/Analytics.vue"),
			meta: { title: "Analytics", auth: true, roles: "all" }
		},
		{
			path: "/masterdata",
			meta: {
				auth: true,
				roles: "all"
			},
			children: [
				{
					path: "role",
					name: "Masterdata-Role",
					component: () => import("@/views/Masterdata/UserDanHakAkses/Role/Index.vue"),
					meta: { title: "Role", auth: true, roles: "all" }
				},
				{
					path: "user",
					name: "Masterdata-User",
					component: () => import("@/views/Masterdata/UserDanHakAkses/User/Index.vue"),
					meta: { title: "User", auth: true, roles: "all" }
				},
				{
					path: "variable",
					name: "Masterdata-Variable",
					component: () => import("@/views/Masterdata/Variable/Index.vue"),
					meta: { title: "Variable", auth: true, roles: "all" }
				},
				{
					path: "note",
					name: "Masterdata-Note",
					component: () => import("@/views/Masterdata/Note/Index.vue"),
					meta: { title: "Note", auth: true, roles: "all" }
				}
			]
		},
		{
			path: "/cms",
			meta: {
				auth: true,
				roles: "all"
			},
			children: [
				{
					path: "artikel",
					name: "CMS-Artikel",
					component: () => import("@/views/CMS/Artikel/Index.vue"),
					meta: { title: "Artikel", auth: true, roles: "all" }
				},
				{
					path: "divisi",
					name: "CMS-Divisi",
					component: () => import("@/views/CMS/Divisi/Index.vue"),
					meta: { title: "Divisi", auth: true, roles: "all" }
				},
				{
					path: "subdivisi",
					name: "CMS-Subdivisi",
					component: () => import("@/views/CMS/Subdivisi/Index.vue"),
					meta: { title: "Subdivisi", auth: true, roles: "all" }
				},
				{
					path: "aktivis",
					name: "CMS-Aktivis",
					component: () => import("@/views/CMS/Activist/Index.vue"),
					meta: { title: "Aktivis", auth: true, roles: "all" }
				},
				{
					path: "pengurus",
					name: "CMS-Pengurus",
					component: () => import("@/views/CMS/Pengurus/Index.vue"),
					meta: { title: "Pengurus", auth: true, roles: "all" }
				},
				{
					path: "event",
					name: "CMS-Event",
					component: () => import("@/views/CMS/Event/Index.vue"),
					meta: { title: "Event", auth: true, roles: "all" }
				},
				{
					path: "image",
					name: "CMS-Image",
					component: () => import("@/views/CMS/Image/Index.vue"),
					meta: { title: "Image", auth: true, roles: "all" }
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
