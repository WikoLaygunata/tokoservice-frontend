import axios from "axios"
import { acceptHMRUpdate, defineStore } from "pinia"

export type SelectOption = {
	value: number | string
	label: string
	raw?: any
}

export type SimpleOptionKey =
	| "customers"
	| "workers"
	| "phoneBrands"
	| "serviceCategories"
	| "roles"

export type RawSimpleItem = {
	id?: number
	name?: string
	title?: string
	phone?: string
	is_active?: boolean
}

const endpointMap: Record<SimpleOptionKey, string> = {
	customers: "customers/simple",
	workers: "workers/simple",
	phoneBrands: "phone-brands/simple",
	serviceCategories: "service-categories/simple",
	roles: "roles/simple"
}

const mapOption = (key: SimpleOptionKey, item: RawSimpleItem): SelectOption => {
	if (key === "roles") {
		return {
			value: item.name ?? "",
			label: item.title ?? item.name ?? "-",
			raw: item
		}
	}

	if (key === "customers" && item.phone) {
		return {
			value: item.id ?? 0,
			label: `${item.name ?? "-"} (${item.phone})`,
			raw: item
		}
	}

	return {
		value: item.id ?? 0,
		label: item.name ?? item.title ?? "-",
		raw: item
	}
}

export const useSelectOptionsStore = defineStore("select-options", {
	state: () => ({
		options: {} as Partial<Record<SimpleOptionKey, SelectOption[]>>,
		rawItems: {} as Partial<Record<SimpleOptionKey, RawSimpleItem[]>>
	}),
	getters: {
		getOptions: state => (key: SimpleOptionKey) => state.options[key] || [],
		getRawItems: state => (key: SimpleOptionKey) => state.rawItems[key] || []
	},
	actions: {
		async ensureOptions(key: SimpleOptionKey, forceRefresh = false) {
			if (!forceRefresh && this.options[key]?.length) {
				return this.options[key] as SelectOption[]
			}

			const { data } = await axios.get(endpointMap[key])
			const rawList: RawSimpleItem[] = data.data || data || []
			this.rawItems[key] = rawList
			const mapped = rawList.map((item: RawSimpleItem) => mapOption(key, item))
			this.options[key] = mapped
			return mapped
		},
		clearOptions(key?: SimpleOptionKey) {
			if (!key) {
				this.options = {}
				this.rawItems = {}
				return
			}
			delete this.options[key]
			delete this.rawItems[key]
		}
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSelectOptionsStore, import.meta.hot))
}
