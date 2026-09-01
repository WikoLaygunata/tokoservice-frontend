import type { Role, Roles } from "@/types/auth.d"
import _castArray from "lodash/castArray"
import { acceptHMRUpdate, defineStore } from "pinia"

// HERE YOU CAN IMPLEMENT YOUR LOGIN
export interface UserRole {
	id: number
	title: string
	name: string
	created_at: string
	updated_at: string
	created_by: string | null
	updated_by: string | null
	access_permissions: AccessPermission[]
}

export type AccessPermission = {
	id: number
	title: string
	name: string
}

export type User = {
	id: number
	username: string
	name: string
	branch_id: number
	is_active: boolean
	deactivated_at: any
	deactivated_by: number | null
	created_at: string
	updated_at: string
	deleted_at: string | null
	created_by: number | null
	updated_by: number | null
	deleted_by: number | null
	access_permissions: AccessPermission[]
	role: UserRole
}

export const useAuthStore = defineStore("auth", {
	state: () => ({
		logged: false,
		role: "admin" as Role | null,
		user: null as User | null,
		token: null as string | null
	}),
	actions: {
		setLogged(payload?: any) {
			this.logged = true
			this.role = payload.user.role.name
			this.user = payload.user
			this.token = payload.token
		},
		setLogout() {
			this.logged = false
			this.role = null
			this.user = null
			this.token = null
		}
	},
	getters: {
		isLogged(state) {
			return state.logged
		},
		userRole(state) {
			return state.role
		},
		getToken(state) {
			return state.token
		},
		isRoleGranted(state) {
			return (roles?: Roles) => {
				if (!roles) {
					return true
				}

				if (!state.role) {
					return false
				}

				const arrRoles: Role[] = _castArray(roles)

				if (arrRoles.includes("all")) {
					return true
				}

				return arrRoles.includes(state.role)
			}
		}
	},
	persist: {
		paths: ["logged", "role", "user", "token"]
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
