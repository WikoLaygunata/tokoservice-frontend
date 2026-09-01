import { onMounted, onUnmounted, ref } from "vue"

/**
 * Format currency
 * This function is used to format the currency value
 *
 * @param {*} value - The value to be formatted
 * @returns - The formatted value
 */
export function formatNumber(value: number | string) {
	// if value is not a number, return 0
	if (isNaN(value as number)) {
		return 0
	}

	// format thousand with dot and decimal with comma
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 20
	}).format(value as number)
}

export function unformatNumber(value: string | number) {
	if (typeof value === "number") {
		return value
	}

	return parseFloat(value.replace(/,/g, ""))
}

export const jsonToFormData = (json: Record<string, any>): FormData => {
	const formData = new FormData()

	Object.entries(json)
		.filter(([_key, val]) => val !== undefined && val !== null && val !== "")
		.forEach(([key, val]) => formData.append(key, val))

	return formData
}

export function formatDateID(value: string) {
	// const date = new Date(value)
	// const day = date.getDate()
	// const month = (date.getMonth() + 1).toString().padStart(2, '0');
	// const year = date.getFullYear()

	// return `${day}-${month}-${year}`

	return new Date(value || new Date())
		.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		})
		.split("/")
		.join("-")
}

export function formatDateDB(value: string) {
	return new Date(value || new Date())
		.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		})
		.split("/")
		.reverse()
		.join("-")
}

export function getFirstDayOfCurrentMonthDB(value: string) {
	const now = new Date(value || new Date())
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

	return firstDayOfMonth
		.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		})
		.split("/")
		.reverse()
		.join("-")
}

export function getFirstDayOfNextMonthDB(value: string) {
	const now = new Date(value || new Date())
	const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

	return firstDayOfNextMonth
		.toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		})
		.split("/")
		.reverse()
		.join("-")
}

export function formatShortDateID(value: string) {
	return new Date(value || new Date()).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	})
}

export function dateNowIDInTimeStamp(value: string) {
	const now = new Date(value || new Date())
	const timestamp = now.getTime()

	return timestamp
}

export function formatdateNowIDInTimeStamp(value: string) {
	return new Date(value || new Date())
		.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		})
		.split("/")
		.join("-")
}

export function formatCompleteDateID(value: string) {
	return new Date(value || new Date())
		.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "long",
			day: "2-digit"
		})
		.split("/")
		.join("-")
}

export function formatDateCompleteWithHoursID(value: string) {
	return new Date(value || new Date())
		.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "long",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		})
		.split("/")
		.join("-")
}

export function formatDateFromYear(value: string) {
	const date = new Date(value || new Date())

	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0") // Months are zero-based
	const day = String(date.getDate()).padStart(2, "0")

	return `${year}-${month}-${day}`
}

export function formatDate(value: string) {
	return new Date(value).toLocaleDateString("id-ID", {
		year: "numeric",
		month: "long",
		day: "numeric"
	})
}

export function formatDateWithMicroseconds(value: Date) {
	const pad = (num: number) => String(num).padStart(2, "0")
	const d = new Date(value)
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(6, "0")}`
}

export function formatTime(value: string) {
	return new Date(value || new Date())
		.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit"
		})
		.replace(".", ":")
}

export function convertToTimestamp(value: string) {
	const [hours, minutes, seconds] = value.split(":").map(Number)
	const date = new Date()
	date.setHours(hours, minutes, seconds, 0)

	return date.getTime()
}

export const getFirstDayOfCurrentMonth = (value: Date) => {
	let now = new Date()

	if (value) {
		now = new Date(value)
	} else {
		now = new Date()
	}

	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

	return firstDayOfMonth
		.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		})
		.split("/")
		.reverse()
		.join("-")
}

export const getFirstDayOfCurrentMonthInTimeStamp = (value?: Date) => {
	let now: Date

	if (value) {
		now = new Date(value)
	} else {
		now = new Date()
	}

	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
	firstDayOfMonth.setHours(0, 0, 0, 0) // Normalize to midnight

	return firstDayOfMonth.getTime()
}

export const getFirstDayOfNextMonth = (value: Date) => {
	let now = new Date()

	if (value) {
		now = new Date(value)
	} else {
		now = new Date()
	}

	const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

	return firstDayOfNextMonth
		.toLocaleDateString("id-ID", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		})
		.split("/")
		.reverse()
		.join("-")
}

export const getFirstDayOfNextMonthInTimeStamp = (value?: Date) => {
	let now: Date

	if (value) {
		now = new Date(value)
	} else {
		now = new Date()
	}

	const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
	firstDayOfNextMonth.setHours(0, 0, 0, 0) // Normalize to midnight

	return firstDayOfNextMonth.getTime()
}

export const formatDateToTimeStamp = (value: Date) => {
	return new Date(value).getTime()
}

export const formatDateTimeToTime = (value: string) => {
	const date = new Date(value)
	const hours = date.getHours()
	const minutes = date.getMinutes()
	const seconds = date.getSeconds()

	return `${hours}:${minutes}:${seconds}`
}

export function getStartTimeOfDay(value: string) {
	const date = new Date(value)
	const today = new Date()

	// Reset today's time to 00:00 for comparison
	today.setHours(0, 0, 0, 0)

	if (date.toDateString() === today.toDateString()) {
		// If the date is today, return the current time
		return new Date(new Date())
			.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit"
			})
			.replace(".", ":")
	} else {
		// If the date is not today, return 00:00
		return "00:00"
	}
}

export function getNowTime() {
	return new Date(new Date())
		.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit"
		})
		.replace(".", ":")
}

export function updateScreenMaxHeight(offset = 250) {
	const maxHeight = ref("0px")

	const updateMaxHeight = () => {
		const availableHeight = window.innerHeight - offset
		maxHeight.value = `${availableHeight}px`
	}

	onMounted(() => {
		updateMaxHeight()
		window.addEventListener("resize", updateMaxHeight)
	})

	onUnmounted(() => {
		window.removeEventListener("resize", updateMaxHeight)
	})

	return maxHeight
}

export function capitalizeWords(str: string) {
	return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
}

export function openWhatsapp(phone: string) {
	const number = phone.startsWith("0") ? phone.replace("0", "62") : phone

	const url = `https://api.whatsapp.com/send?phone=${number}`

	window.open(url, "_blank")
}
