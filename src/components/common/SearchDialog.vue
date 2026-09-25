<template>
	<n-modal v-model:show="showSearchBox" class="search-box-modal">
		<n-card
			aria-modal="true"
			:bordered="false"
			content-style="padding: 0;"
			role="dialog"
			size="huge"
			style="width: 600px"
		>
			<div class="search-box" @keydown.down="nextItem()" @keydown.up="prevItem()">
				<div class="search-input flex items-center">
					<Icon :name="SearchIcon" :size="16"></Icon>
					<input v-model="search" class="grow" placeholder="Search" />
					<n-text code>ESC</n-text>
					<Icon class="cursor-pointer" :name="CloseIcon" :size="20" @click="closeBox()"></Icon>
				</div>
				<n-divider />
				<n-scrollbar ref="scrollContent" style="height: 400px">
					<div class="conten-wrap">
						<div v-for="group of filteredGroups" :key="group.name" class="group">
							<div class="group-title">{{ group.name }}</div>
							<div class="group-list">
								<button
									v-for="item of group.items"
									:id="item.key.toString()"
									:key="item.key"
									class="item flex items-center"
									:class="{ active: item.key === activeItem }"
									@click="callAction(item.action)"
								>
									<div class="icon">
										<n-avatar v-if="item.iconImage" round :size="28" :src="item.iconImage" />
										<Icon v-if="item.iconName" :name="item.iconName" :size="18"></Icon>
									</div>
									<div class="title grow">
										<Highlighter
											:autoEscape="true"
											highlightClassName="highlight"
											:searchWords="keywords"
											:textToHighlight="item.title"
										/>
									</div>
									<div class="label">{{ item.label }}</div>
								</button>
							</div>
						</div>
						<div v-if="!filteredGroups.length" class="group-empty">
							We couldn't find anything matching "{{ search }}"
						</div>
					</div>
				</n-scrollbar>
				<n-divider />
				<div class="hint-bar flex items-center justify-center">
					<div class="hint flex items-center justify-center">
						<div class="icon">
							<Icon :name="ArrowEnterIcon" :size="12"></Icon>
						</div>
						<span class="label">to select</span>
					</div>
					<div class="hint flex items-center justify-center">
						<div class="icon">
							<Icon :name="ArrowSortIcon" :size="12"></Icon>
						</div>
						<span class="label">to navigate</span>
					</div>
				</div>
			</div>
		</n-card>
	</n-modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { NText, NModal, NCard, NDivider, NAvatar, NScrollbar, type ScrollbarInst } from "naive-ui"
import { useMagicKeys, whenever } from "@vueuse/core"
import Highlighter from "vue-highlight-words"
import { useRouter } from "vue-router"
import { useThemeSwitch } from "@/composables/useThemeSwitch"
import { useFullscreenSwitch } from "@/composables/useFullscreenSwitch"
import { useSearchDialog } from "@/composables/useSearchDialog"
import { getOS } from "@/utils"
import Icon from "@/components/common/Icon.vue"

const SearchIcon = "ion:search-outline"
const DashboardIcon = "tabler:layout-dashboard"
const ChartBarIcon = "tabler:chart-bar"
const RoleIcon = "tabler:shield"
const UserIcon = "tabler:user"
const VariableIcon = "tabler:variable"
const NoteIcon = "tabler:notes"
const ToolIcon = "tabler:tool"
const CustomerIcon = "tabler:users"
const WorkerIcon = "tabler:user-check"
const PhoneBrandIcon = "tabler:device-mobile"
const ServiceCatIcon = "tabler:cpu"
const WaTemplateIcon = "tabler:brand-whatsapp"
const SchoolIcon = "tabler:school"
const UsersIcon = "tabler:users"
const ProfileIcon = "tabler:user-circle"
const ArrowEnterIcon = "tabler:arrow-right"
const ArrowSortIcon = "tabler:arrows-sort"
const FullScreenIcon = "tabler:maximize"
const DarkModeIcon = "ion:moon-outline"
const CloseIcon = "ion:close"

interface GroupItem {
	iconName: string | null
	iconImage: string | null
	key: number | string
	title: string
	label: string
	tags?: string
	action: () => void
}

interface Group {
	name: string
	items: GroupItem[]
}
type Groups = Group[]

const router = useRouter()

const showSearchBox = ref(false)
const search = ref("")
const activeItem = ref<null | string | number>(null)
const commandIcon = ref("⌘")
const scrollContent = ref<(ScrollbarInst & { $el: any }) | null>(null)

const groups = ref<Groups>([
	{
		name: "Utama",
		items: [
			{
				iconName: DashboardIcon,
				iconImage: null,
				key: "dashboard",
				title: "Dashboard",
				label: "/",
				action() {
					router.push({ name: "Dashboard" })
				}
			},
			{
				iconName: ChartBarIcon,
				iconImage: null,
				key: "analytics",
				title: "Analytics",
				label: "/analytics",
				action() {
					router.push({ name: "Analytics-Spareparts" })
				}
			},
			{
				iconName: ProfileIcon,
				iconImage: null,
				key: "profile",
				title: "Profile",
				label: "/profile",
				action() {
					router.push({ name: "Profile" })
				}
			}
		]
	},
	{
		name: "Masterdata",
		items: [
			{
				iconName: RoleIcon,
				iconImage: null,
				key: "masterdata-role",
				title: "Role",
				label: "/masterdata/role",
				action() {
					router.push({ name: "Masterdata-Role" })
				}
			},
			{
				iconName: UserIcon,
				iconImage: null,
				key: "masterdata-user",
				title: "User",
				label: "/masterdata/user",
				action() {
					router.push({ name: "Masterdata-User" })
				}
			},
			{
				iconName: VariableIcon,
				iconImage: null,
				key: "masterdata-variable",
				title: "Variable",
				label: "/masterdata/variable",
				action() {
					router.push({ name: "Masterdata-Variable" })
				}
			},
			{
				iconName: NoteIcon,
				iconImage: null,
				key: "masterdata-note",
				title: "Note",
				label: "/masterdata/note",
				action() {
					router.push({ name: "Masterdata-Note" })
				}
			}
		]
	},
	{
		name: "Toko Servis",
		items: [
			{
				iconName: ToolIcon,
				iconImage: null,
				key: "service-tickets",
				title: "Meja Servis HP",
				label: "/service-tickets",
				action() {
					router.push({ name: "ServiceTickets" })
				}
			},
			{
				iconName: CustomerIcon,
				iconImage: null,
				key: "masterdata-customer",
				title: "Pelanggan",
				label: "/masterdata/customer",
				action() {
					router.push({ name: "Masterdata-Customer" })
				}
			},
			{
				iconName: WorkerIcon,
				iconImage: null,
				key: "masterdata-worker",
				title: "Teknisi",
				label: "/masterdata/worker",
				action() {
					router.push({ name: "Masterdata-Worker" })
				}
			},
			{
				iconName: PhoneBrandIcon,
				iconImage: null,
				key: "masterdata-phone-brand",
				title: "Merek HP",
				label: "/masterdata/phone-brand",
				action() {
					router.push({ name: "Masterdata-PhoneBrand" })
				}
			},
			{
				iconName: ServiceCatIcon,
				iconImage: null,
				key: "masterdata-service-category",
				title: "Kategori Servis",
				label: "/masterdata/service-category",
				action() {
					router.push({ name: "Masterdata-ServiceCategory" })
				}
			},
			{
				iconName: WaTemplateIcon,
				iconImage: null,
				key: "masterdata-wa-template",
				title: "Template WhatsApp",
				label: "/masterdata/wa-template",
				action() {
					router.push({ name: "Masterdata-WaTemplate" })
				}
			}
		]
	},

	{
		name: "Actions",
		items: [
			{
				iconName: FullScreenIcon,
				iconImage: null,
				key: "action-fullscreen",
				title: "Toggle fullscreen",
				label: "Action",
				action() {
					useFullscreenSwitch().toggle()
				}
			},
			{
				iconName: DarkModeIcon,
				iconImage: null,
				key: "action-darkmode",
				title: "Toggle dark mode",
				label: "Action",
				action() {
					useThemeSwitch().toggle()
				}
			}
		]
	}
])

const keywords = computed<string[]>(() => {
	if (search.value.length > 1) {
		return search.value.split(" ").filter(k => k)
	} else {
		return []
	}
})
const filteredGroups = computed<Groups>(() => {
	if (keywords.value.length === 0) {
		return groups.value
	}
	const newGroups: Groups = []
	for (const group of groups.value) {
		const items = group.items.filter(item => {
			if (keywords.value.filter(k => item.title.toLowerCase().indexOf(k.toLowerCase()) !== -1).length !== 0) {
				return true
			}
			if (
				item.tags &&
				keywords.value.filter(k => item.tags?.toLowerCase().indexOf(k.toLowerCase()) !== -1).length !== 0
			) {
				return true
			}
			return false
		})
		if (items.length) {
			newGroups.push({
				name: group.name,
				items
			})
		}
	}
	return newGroups
})

/*eslint  @typescript-eslint/no-unused-vars: "off"*/
const filteredFlattenItems = computed<GroupItem[]>(() => {
	const items = []

	for (const group of filteredGroups.value) {
		items.push(...group.items)
	}

	return items
})

function openBox(e?: MouseEvent) {
	if (!showSearchBox.value) {
		showSearchBox.value = true
		setTimeout(() => {
			search.value = ""
			activeItem.value = null
		}, 100)
	}
	return e
}
function closeBox() {
	showSearchBox.value = false
	search.value = ""
	activeItem.value = null
}
function callAction(action: () => void) {
	action()
	closeBox()
}
function nextItem() {
	const currentIndex = filteredFlattenItems.value.findIndex(item => item.key === activeItem.value)
	if (currentIndex === filteredFlattenItems.value.length - 1 || activeItem.value === null) {
		activeItem.value = filteredFlattenItems.value[0].key
	} else {
		activeItem.value = filteredFlattenItems.value[currentIndex + 1].key
	}
	centerItem()
}
function prevItem() {
	const currentIndex = filteredFlattenItems.value.findIndex(item => item.key === activeItem.value)
	if (currentIndex === 0 || activeItem.value === null) {
		activeItem.value = filteredFlattenItems.value[filteredFlattenItems.value.length - 1].key
	} else {
		activeItem.value = filteredFlattenItems.value[currentIndex - 1].key
	}
	centerItem()
}
function performAction() {
	const item = filteredFlattenItems.value.find(item => item.key === activeItem.value)
	if (item) {
		callAction(item.action)
	}
}
function centerItem() {
	const element = document.getElementById(activeItem.value?.toString() || "")
	if (element && scrollContent.value) {
		element.scrollIntoView({ block: "nearest" })
	}
}

onMounted(() => {
	const isWindows = getOS() === "Windows"
	commandIcon.value = isWindows ? "CTRL" : "⌘"

	const keys = useMagicKeys()
	const ActiveCMD = isWindows ? keys["ctrl+k"] : keys["cmd+k"]
	const Enter = keys["enter"]

	useSearchDialog().trigger(openBox)

	whenever(ActiveCMD, () => {
		openBox()
	})

	whenever(Enter, () => {
		if (showSearchBox.value) {
			performAction()
		}
	})
})
</script>

<style lang="scss" scoped>
.search-box-modal {
	.search-box {
		border-radius: 4px;

		.search-input {
			height: 50px;
			gap: 20px;
			padding: 20px;

			input {
				background: transparent;
				outline: none;
				border: none;
				min-width: 100px;
			}

			.n-text--code {
				white-space: nowrap;
			}
		}

		.n-divider {
			margin-top: 0;
			margin-bottom: 0;
		}

		.conten-wrap {
			padding-bottom: 30px;

			.group-empty {
				text-align: center;
				padding: 30px 0 40px 0;
			}
			.group {
				padding: 0 10px;
				.group-title {
					opacity: 0.6;
					margin-bottom: 5px;
					padding: 5px 10px;
					padding-top: 20px;
				}
				.group-list {
					.item {
						padding: 7px 10px;
						gap: 10px;
						cursor: pointer;
						border-radius: 10px;
						width: 100%;
						text-align: left;

						.icon {
							width: 28px;
							height: 28px;
							border-radius: 50%;
							background-color: var(--primary-005-color);
							display: flex;
							justify-content: center;
							align-items: center;
						}
						.title {
							font-weight: bold;
						}
						.label {
							opacity: 0.8;
							font-size: 0.9em;
						}

						&.active {
							background-color: var(--hover-005-color);
						}
						&:hover {
							box-shadow: 0px 0px 0px 1px var(--primary-color) inset;
						}
					}
				}
			}
		}

		.hint-bar {
			font-size: 12px;
			gap: 20px;
			padding: 10px 0;
			.icon {
				background-color: var(--code-color);
				width: 18px;
				height: 18px;
				padding-top: 1px;
				text-align: center;
				border-radius: 4px;
				margin-right: 5px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.label {
				opacity: 0.7;
			}
		}
	}
}
</style>
