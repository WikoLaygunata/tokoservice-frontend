import axios from "axios"
import { acceptHMRUpdate, defineStore } from "pinia"

export type SelectOption = {
	value: number | string
	label: string
}

type SimpleOptionKey =
	| "divisions"
	| "subdivisions"
	| "faculties"
	| "majors"
	| "courses"
	| "contributors"
	| "roles"
	| "mentors"

type RawSimpleItem = {
	id?: number
	name?: string
	title?: string
}

const endpointMap: Record<SimpleOptionKey, string> = {
	divisions: "divisions/simple",
	subdivisions: "subdivisions/simple",
	faculties: "faculties/simple",
	majors: "majors/simple",
	courses: "courses/simple",
	contributors: "contributors/simple",
	roles: "roles/simple",
	mentors: "mentors/simple"
}

const mapOption = (key: SimpleOptionKey, item: RawSimpleItem): SelectOption => {
	if (key === "roles") {
		return {
			value: item.name ?? "",
			label: item.title ?? "-"
		}
	}

	return {
		value: item.id ?? 0,
		label: item.name ?? "-"
	}
}

export const useSelectOptionsStore = defineStore("select-options", {
	state: () => ({
		options: {} as Partial<Record<SimpleOptionKey, SelectOption[]>>
	}),
	getters: {
		getOptions: state => (key: SimpleOptionKey) => state.options[key] || []
	},
	actions: {
		async ensureOptions(key: SimpleOptionKey, forceRefresh = false) {
			if (!forceRefresh && this.options[key]?.length) {
				return this.options[key] as SelectOption[]
			}

			const { data } = await axios.get(endpointMap[key])
			const options = (data.data || []).map((item: RawSimpleItem) => mapOption(key, item))
			this.options[key] = options
			return options
		},
		clearOptions(key?: SimpleOptionKey) {
			if (!key) {
				this.options = {}
				return
			}
			delete this.options[key]
		}
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSelectOptionsStore, import.meta.hot))
}
