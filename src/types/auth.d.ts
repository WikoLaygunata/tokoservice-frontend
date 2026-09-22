export type Role = "all" | "admin" | "owner" | "technician" | "frontdesk"
export type Roles = Role | Role[]

export interface RouteMetaAuth {
	checkAuth?: boolean
	authRedirect?: string
	auth?: boolean
	roles?: Roles
}
